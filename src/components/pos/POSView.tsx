import { usePOSCart } from "@/hooks/usePOSCart";
import { ProductCatalog } from "@/components/pos/components/ProductCatalog";
import { CartSection } from "@/components/pos/components/CartSection";
import { PaymentSection } from "@/components/pos/components/PaymentSection";
import { VariantSelectionModal } from "@/components/pos/components/VariantSelectionModal";
import { ReceiptModal } from "@/components/pos/components/ReceiptModal";

export function POSView() {
  const {
    cart,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    customizingProduct,
    setCustomizingProduct,
    completedOrder,
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
    isSubmitting,
    formKey
  } = usePOSCart();

  return (
    <div className="w-full flex flex-col lg:h-[calc(100vh-11rem)] lg:overflow-hidden animate-fade-in select-none">

      {/* Page Header */}
      <div className="mb-4 text-left shrink-0">
        <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary tracking-tight leading-none">
          Walk-In POS
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Select catalog items, customize variants, collect payments, and print customer thermal receipts instantly.
        </p>
      </div>

      {/* Main split dashboard layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">

        {/* Left Side: Product Catalogue Grid (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 h-full">
          <ProductCatalog onAddProduct={handleAddProduct} />
        </div>

        {/* Right Side: Cart Section & Checkout (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0 h-full pr-1 overflow-y-auto custom-scrollbar">

          {/* Cart items listing */}
          <div className="flex-1 flex flex-col min-h-[400px]">
            <CartSection
              items={cart}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              onUpdateInstructions={handleUpdateInstructions}
              onClearCart={handleClearCart}
            />
          </div>

          {/* Payment collection panel */}
          <div className="bg-white border border-border-subtle rounded-xl p-3.5 shadow-card shrink-0">
            <PaymentSection
              key={formKey}
              subtotal={subtotal}
              discount={discount}
              onUpdateDiscount={setDiscount}
              tax={tax}
              grandTotal={grandTotal}
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
              cashReceived={cashReceived}
              onUpdateCashReceived={setCashReceived}
              changeAmount={changeAmount}
              onCompleteSale={handleCompleteSale}
              isCartEmpty={cart.length === 0}
              isSubmitting={isSubmitting}
            />
          </div>

        </div>

      </div>

      {/* Product customization dialog */}
      {customizingProduct && (
        <VariantSelectionModal
          isOpen={!!customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          product={customizingProduct}
          onConfirm={handleConfirmCustomization}
        />
      )}

      {/* Printed receipt modal */}
      {completedOrder && (
        <ReceiptModal
          isOpen={!!completedOrder}
          onClose={handleCloseReceiptModal}
          order={completedOrder}
          cashReceived={cashReceived}
          changeAmount={changeAmount}
        />
      )}

    </div>
  );
}
