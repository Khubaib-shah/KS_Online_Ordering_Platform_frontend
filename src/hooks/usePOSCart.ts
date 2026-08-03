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
  const { simulateNewOrderInList } = useOrders();

  // Active Transaction States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Modals & Popovers States
  const [customizingProduct, setCustomizingProduct] = useState<MenuItem | null>(null);
  const [customizingQty, setCustomizingQty] = useState<number>(1);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

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
  const handleCompleteSale = (custName: string, custPhone: string) => {
    if (cart.length === 0) return;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `POS-${dateStr}-${randStr}`;

    const activeBranchId = activeBranchFilterId !== 'all' ? activeBranchFilterId : (branches[0]?.id || 'indolj-gulshan');
    const activeBranchObj = branches.find(b => b.id === activeBranchId) || branches[0];
    const branchName = activeBranchObj ? activeBranchObj.name : 'Main Branch';

    const newOrder: Order = {
      orderNumber,
      customer: {
        name: custName.trim() || 'Walk-in Customer',
        phone: custPhone.trim() || 'Guest',
        isGuest: true,
      },
      delivery: {
        type: 'TAKEAWAY',
        instructions: 'POS Counter Sale',
      },
      items: cart.map((i) => ({
        id: i.productId,
        name: i.name,
        qty: i.qty,
        unitPrice: i.basePrice + i.addedPrice,
        total: (i.basePrice + i.addedPrice) * i.qty,
        variants: i.selectedVariants.map((v) => `${v.groupName}: ${v.optionName}`),
        specialNote: i.instructions || '',
      })),
      subtotal,
      tax,
      deliveryFee: 0,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      status: 'DELIVERED',
      placedAt: new Date().toISOString(),
      timeline: [
        { status: 'pending', timestamp: new Date().toISOString(), note: 'Counter POS order created' },
        { status: 'delivered', timestamp: new Date().toISOString(), note: 'Sale complete' },
      ],
      notes: [],
      branchId: activeBranchId,
      branchName,
    };

    simulateNewOrderInList(newOrder);

    setCompletedOrder(newOrder);
    addToast(`Sale completed! Order ${orderNumber} placed`, 'success');
  };

  const handleCloseReceiptModal = () => {
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
    branches
  };
}
