import { useState, useMemo, useRef } from 'react';
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
  
  const pendingOrdersRef = useRef<Record<string, { dbId?: string, isCreating: boolean, cancelled: boolean }>>({});

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
    choices: { groupId?: string; optionId?: string; groupName: string; optionName: string; additionalPrice: number }[]
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
  const getPrefix = (nameOrSlug?: string) => {
    if (!nameOrSlug) return 'ORD';
    const parts = nameOrSlug.split(/[-_\s]+/);
    if (parts.length >= 2) {
      return parts.slice(0, 3).map(p => p[0].toUpperCase()).join('');
    }
    return nameOrSlug.substring(0, 3).toUpperCase();
  };

  const handleCompleteSale = async (custName: string, custPhone: string, fulfillmentType: string = 'TAKEAWAY', address: string = '', tableNumber?: string) => {
    if (cart.length === 0) {
      addToast('Cart is empty', 'error');
      return;
    }
    
    setIsSubmitting(true);

    const activeBranchId = activeBranchFilterId !== 'all' ? activeBranchFilterId : (branches[0]?.id || 'indolj-gulshan');
    const branchName = activeTenant?.name || 'Main Branch';
    const finalCustName = custName.trim() || (fulfillmentType === 'DELIVERY' ? 'Phone Customer' : 'Walk-in Customer');

    const prefix = getPrefix(activeTenant?.slug || activeTenant?.name);
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `${prefix}-${randomNum}`;
    const draftId = `local_${Date.now()}`;

    const backendPayload = {
      orderNumber,
      customerName: finalCustName,
      customerPhone: custPhone.trim() || 'Guest',
      fulfillmentType: fulfillmentType,
      deliveryAddress: address.trim(),
      delivery_address: address.trim(),
      deliveryInstructions: fulfillmentType === 'DELIVERY' ? 'Phone Order via POS' : 'POS Counter Sale',
      delivery_instructions: fulfillmentType === 'DELIVERY' ? 'Phone Order via POS' : 'POS Counter Sale',
      private_kitchen_notes: 'Created via POS',
      tableNumber: tableNumber,
      items: cart.map((i) => ({
        menuItemId: i.productId,
        itemName: i.name,
        quantity: i.qty,
        unitPrice: i.basePrice + i.addedPrice,
        totalPrice: (i.basePrice + i.addedPrice) * i.qty,
        itemNote: i.instructions || '',
        selectedVariants: i.selectedVariants?.map((sv: any) => ({
          variantGroupId: sv.groupId,
          optionId: sv.optionId
        })) || []
      })),
      subtotal,
      taxAmount: tax,
      deliveryFee: 0,
      discountAmount: discount,
      grandTotal,
      paymentMethod,
      paymentStatus: fulfillmentType === 'DINE_IN' ? 'UNPAID' : 'PAID',
      status: fulfillmentType === 'TAKEAWAY' ? 'COMPLETED' : 'PENDING',
      branchId: activeBranchId,
    };

    const draftOrder: Order = {
      id: draftId,
      orderNumber,
      customer: {
        name: finalCustName,
        phone: custPhone.trim() || 'Guest',
      },
      delivery: {
        type: fulfillmentType as any,
        address: address.trim(),
        instructions: fulfillmentType === 'DELIVERY' ? 'Phone Order via POS' : 'POS Counter Sale',
      },
      tableNumber: tableNumber,
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        qty: i.qty,
        unitPrice: i.basePrice + i.addedPrice,
        total: (i.basePrice + i.addedPrice) * i.qty,
        variants: i.selectedVariants?.map((sv: any) => sv.optionName) || [],
      })),
      subtotal,
      tax,
      deliveryFee: 0,
      discount,
      grandTotal,
      paymentMethod: paymentMethod as any,
      paymentStatus: fulfillmentType === 'DINE_IN' ? 'UNPAID' : 'PAID',
      status: fulfillmentType === 'TAKEAWAY' ? 'COMPLETED' : 'PENDING',
      placedAt: new Date().toISOString(),
      timeline: [],
      notes: [],
      branchName,
    };

    // Open UI Instantly
    setCompletedOrder(draftOrder);
    pendingOrdersRef.current[draftId] = { isCreating: true, cancelled: false };
    setIsSubmitting(false);

    // Fire background API Call
    processOrderInBackground(draftId, backendPayload, fulfillmentType, address, branchName);
  };

  const processOrderInBackground = async (draftId: string, backendPayload: any, fulfillmentType: string, address: string, branchName: string) => {
    try {
      const newOrder = await createOrder(backendPayload);
      
      const state = pendingOrdersRef.current[draftId];
      if (state) {
        if (state.cancelled) {
          // User already cancelled before this finished!
          const { ordersApi } = await import('@/lib/api/orders.api');
          await ordersApi.deleteOrder(newOrder.id || newOrder.orderNumber);
        } else {
          state.isCreating = false;
          state.dbId = newOrder.id || newOrder.orderNumber;
        }
      }
      
    } catch (error) {
      console.error('Failed to create order', error);
      addToast('Failed to sync POS order to database.', 'error');
    }
  };

  const handleCloseReceiptModal = async (didCancel: boolean = false) => {
    const currentOrder = completedOrder;
    setCompletedOrder(null);

    if (didCancel && currentOrder?.id) {
      const state = pendingOrdersRef.current[currentOrder.id];
      if (state) {
        if (state.isCreating) {
          // Still in flight
          state.cancelled = true;
          addToast('Order cancelled.', 'info');
        } else if (state.dbId) {
          // Already created
          try {
            const { ordersApi } = await import('@/lib/api/orders.api');
            await ordersApi.deleteOrder(state.dbId);
            addToast('Order record deleted.', 'info');
          } catch (err) {
            addToast('Failed to delete order record.', 'error');
          }
        }
      } else {
        // Fallback for non-drafts
        try {
          const { ordersApi } = await import('@/lib/api/orders.api');
          await ordersApi.deleteOrder(currentOrder.id);
          addToast('Order record deleted.', 'info');
        } catch (err) {
          addToast('Failed to delete order record.', 'error');
        }
      }
      return;
    }
    
    setFormKey(prev => prev + 1);
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
