import { useState, useMemo } from 'react';
import { MenuItem } from '../types/menu';
import { CartItem } from '../components/pos/components/CartItemRow';
import { Order } from '../types/order';
import { useBranchStore } from '../store/branchStore';
import { useUIStore } from '../store/uiStore';
import { useTenantStore } from '../store/tenantStore';
import { useOrders } from './useOrders';

export function usePOSCart() {
  const { activeBranchFilterId, branches } = useBranchStore();
  const { addToast } = useUIStore();
  const { activeTenant } = useTenantStore();
  const { createOrder } = useOrders();

  // Active Transaction States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Modals & Popovers States
  const [customizingProduct, setCustomizingProduct] = useState<MenuItem | null>(null);
  const [customizingQty, setCustomizingQty] = useState<number>(1);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Cart math calculations
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.basePrice + item.addedPrice) * item.qty, 0);
  }, [cart]);

  // Dynamic General Sales Tax (GST) from tenant settings
  const tax = useMemo(() => {
    const rate = activeTenant?.taxRate ?? 0; // Fallback to 15% if undefined
    return Math.round(subtotal * (rate / 100));
  }, [subtotal, activeTenant?.taxRate]);

  const grandTotal = useMemo(() => {
    const total = subtotal + tax - discount;
    return total < 0 ? 0 : total;
  }, [subtotal, tax, discount]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'CASH' || cashReceived <= grandTotal) return 0;
    return cashReceived - grandTotal;
  }, [paymentMethod, cashReceived, grandTotal]);

  // Handle adding products to Cart
  const handleAddProduct = (product: MenuItem, quantity: number = 1) => {
    const groups = product.variantGroups || product.variants || [];
    if (groups.length > 0) {
      setCustomizingProduct(product);
      setCustomizingQty(quantity);
    } else {
      const itemPrice = product.discountPrice !== undefined && product.discountPrice < product.basePrice && product.discountPrice > 0
        ? product.discountPrice
        : product.basePrice;

      const cartItemId = `${product.id}-default`;

      setCart((prev) => {
        const existsIdx = prev.findIndex((i) => i.id === cartItemId);
        if (existsIdx !== -1) {
          const updated = [...prev];
          updated[existsIdx].qty += quantity;
          return updated;
        }
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            basePrice: itemPrice,
            addedPrice: 0,
            qty: quantity,
            selectedVariants: [],
            thumbnail: product.image,
          },
        ];
      });

      addToast(`${product.name} added to cart`, 'success');
    }
  };

  // Confirm custom variants and add customized item to Cart
  const handleConfirmCustomization = (
    choices: { groupName: string; optionName: string; additionalPrice: number }[]
  ) => {
    if (!customizingProduct) return;

    const product = customizingProduct;
    const baseItemPrice = product.discountPrice !== undefined && product.discountPrice < product.basePrice && product.discountPrice > 0
      ? product.discountPrice
      : product.basePrice;

    const addedPrice = choices.reduce((sum, c) => sum + c.additionalPrice, 0);

    const signature = choices
      .map((c) => `${c.groupName}-${c.optionName}`)
      .sort()
      .join('|');
    const cartItemId = `${product.id}-${signature || 'default'}`;

    setCart((prev) => {
      const existsIdx = prev.findIndex((i) => i.id === cartItemId);
      if (existsIdx !== -1) {
        const updated = [...prev];
        updated[existsIdx].qty += customizingQty;
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          basePrice: baseItemPrice,
          addedPrice,
          qty: customizingQty,
          selectedVariants: choices,
          thumbnail: product.image,
        },
      ];
    });

    addToast(`${product.name} customized and added to cart`, 'success');
    setCustomizingProduct(null);
  };

  // Update Item Quantity in Cart
  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, qty: newQty } : item))
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Update instructions note on an item
  const handleUpdateInstructions = (itemId: string, noteText: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, instructions: noteText } : item))
    );
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashReceived(0);
  };

  // Complete walk-in POS sale transaction
  const handleCompleteSale = async (custName: string, custPhone: string, fulfillmentType: string = 'TAKEAWAY', address: string = '') => {
    if (cart.length === 0) {
      addToast('Cart is empty', 'error');
      return;
    }
    
    setIsSubmitting(true);

    const activeBranchId = activeBranchFilterId !== 'all' ? activeBranchFilterId : (branches[0]?.id || 'indolj-gulshan');
    const branchName = activeTenant?.name || 'Main Branch';
    const finalCustName = custName.trim() || (fulfillmentType === 'DELIVERY' ? 'Phone Customer' : 'Walk-in Customer');

    const backendPayload = {
      customerName: finalCustName,
      customerPhone: custPhone.trim() || 'Guest',
      fulfillmentType: fulfillmentType,
      deliveryAddress: address.trim(),
      delivery_address: address.trim(),
      deliveryInstructions: fulfillmentType === 'DELIVERY' ? 'Phone Order via POS' : 'POS Counter Sale',
      delivery_instructions: fulfillmentType === 'DELIVERY' ? 'Phone Order via POS' : 'POS Counter Sale',
      private_kitchen_notes: 'Created via POS',
      items: cart.map((i) => ({
        menuItemId: i.productId,
        itemName: i.name,
        quantity: i.qty,
        unitPrice: i.basePrice + i.addedPrice,
        totalPrice: (i.basePrice + i.addedPrice) * i.qty,
        itemNote: i.instructions || '',
      })),
      subtotal,
      taxAmount: tax,
      deliveryFee: 0,
      discountAmount: discount,
      grandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      status: 'DELIVERED',
      branchId: activeBranchId,
    };

    try {
      const newOrder = await createOrder(backendPayload);
      
      // Inject address manually if the backend failed to return it, so the receipt still looks right
      if (fulfillmentType === 'DELIVERY' && address.trim()) {
        if (!newOrder.delivery) newOrder.delivery = { type: 'DELIVERY' } as any;
        if (!newOrder.delivery.address) newOrder.delivery.address = address.trim();
      }
      
      setCompletedOrder({ ...newOrder, branchName });
      addToast(`Sale completed! Order ${newOrder.orderNumber} placed`, 'success');
    } catch (error) {
      console.error('Failed to create order', error);
      addToast('Failed to create order, please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseReceiptModal = async (didCancel: boolean = false) => {
    if (didCancel && completedOrder?.id) {
      try {
        const { ordersApi } = await import('@/lib/api/orders.api');
        await ordersApi.cancelOrder(completedOrder.id, 'Cancelled from POS receipt modal');
        // Do not increment formKey, keep the customer info intact
        addToast('Order record cancelled and removed.', 'info');
      } catch (err) {
        addToast('Failed to cancel order record.', 'error');
      }
      setCompletedOrder(null);
      return;
    }
    
    // Successfully completed the flow, now clear the form
    setFormKey(prev => prev + 1);
    setCompletedOrder(null);
    handleClearCart();
  };

  return {
    cart,
    setCart,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    customizingProduct,
    setCustomizingProduct,
    customizingQty,
    setCustomizingQty,
    completedOrder,
    setCompletedOrder,
    subtotal,
    tax,
    grandTotal,
    changeAmount,
    handleAddProduct,
    handleConfirmCustomization,
    handleUpdateQty,
    handleRemoveItem,
    handleUpdateInstructions,
    handleClearCart,
    handleCompleteSale,
    handleCloseReceiptModal,
    activeBranchFilterId,
    branches,
    isSubmitting,
    formKey
  };
}
