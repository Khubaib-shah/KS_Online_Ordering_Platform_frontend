import { Select } from '../ui/Select';
import React from 'react';
import { Input } from '../ui/Input';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Order } from '../../types/order';
import { Tenant } from '../../types/tenant';
import { Branch } from '../../types/branch';
import { ReceiptType } from '../../types/print';

// 80mm width is approximately 226.77 points in PDF units.
// We make the height variable or set a standard length like 450 points, which is standard for thermal receipts.
const styles = StyleSheet.create({
  page: {
    padding: 15,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.3,
    color: '#1a1a1a',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  restaurantName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  restaurantTagline: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  address: {
    fontSize: 7,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  heavyDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    marginVertical: 8,
  },
  metaContainer: {
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    marginBottom: 2,
  },
  metaLabel: {
    color: '#555555',
  },
  metaValue: {
    fontWeight: 'bold',
  },
  docketHeader: {
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 6,
    marginBottom: 8,
  },
  docketHeaderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTable: {
    marginTop: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 3,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eeeeee',
  },
  itemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  itemMeta: {
    fontSize: 7,
    color: '#555555',
    marginTop: 1,
  },
  itemNote: {
    fontSize: 7,
    color: '#b45309',
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
    width: 60,
  },
  itemQty: {
    fontSize: 8,
    color: '#555555',
  },
  itemTotal: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalsContainer: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
    fontSize: 8,
    marginBottom: 2,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
    fontSize: 10,
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 3,
    marginTop: 4,
  },
  paymentContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 5,
    marginTop: 8,
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  paymentStatus: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#15803d',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  unpaidStatus: {
    color: '#be123c',
  },
  barcode: {
    marginTop: 12,
    alignItems: 'center',
  },
  barcodeLines: {
    flexDirection: 'row',
    height: 18,
    alignItems: 'center',
    marginBottom: 2,
  },
  barcodeText: {
    fontSize: 6,
    color: '#888888',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 15,
    alignItems: 'center',
  },
  footerGreeting: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  footerTag: {
    fontSize: 6,
    color: '#999999',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

interface ReceiptDocumentProps {
  order: Order;
  tenant?: Tenant | null;
  branch?: Branch | null;
  receiptType: ReceiptType;
}

export function ReceiptDocument({ order, tenant, branch, receiptType }: ReceiptDocumentProps) {
  const currencySymbol = tenant?.config?.currencySymbol || tenant?.currency || 'Rs.';

  const isKitchen = receiptType === 'kitchen_docket';
  const isInvoice = receiptType === 'invoice';

  return (
    <Document>
      <Page size={[226.77, 650]} style={styles.page}>
        {/* Branch / Business Header */}
        {!isKitchen ? (
          <View style={styles.titleContainer}>
            {tenant?.config?.receiptConfig?.headerMessage ? (
              tenant.config.receiptConfig.headerMessage.split('\n').map((line, idx) => (
                <Text key={`header-${idx}`} style={idx === 0 ? styles.restaurantName : styles.address}>
                  {line}
                </Text>
              ))
            ) : (
              <>
                <Text style={styles.restaurantName}>{tenant?.name || 'Indolj Fine Dining'}</Text>
                {tenant?.tagline && <Text style={styles.restaurantTagline}>{tenant.tagline}</Text>}
                <Text style={styles.address}>
                  {branch?.name ? `${branch.name} - ` : ''}
                  {branch?.address || tenant?.address || 'Karachi, Pakistan'}
                </Text>
                {branch?.phone && <Text style={styles.address}>Tel: {branch.phone}</Text>}
              </>
            )}
          </View>
        ) : (
          <View style={styles.docketHeader}>
            <Text style={styles.docketHeaderText}>KITCHEN ORDER DOCKET</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Ticket Metadata */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>ORDER NUMBER:</Text>
            <Text style={styles.metaValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>DATE & TIME:</Text>
            <Text style={styles.metaValue}>
              {new Date(order.placedAt || Date.now()).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>ORDER TYPE:</Text>
            <Text style={styles.metaValue}>{order.delivery?.type || 'Dining'}</Text>
          </View>
          {order.customer?.name && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>CUSTOMER:</Text>
              <Text style={styles.metaValue}>{order.customer.name}</Text>
            </View>
          )}
          {order.customer?.phone && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>CONTACT:</Text>
              <Text style={styles.metaValue}>{order.customer.phone}</Text>
            </View>
          )}
          {isKitchen && order.delivery?.instructions && (
            <View style={{ marginTop: 4, padding: 4, backgroundColor: '#fffbeb', borderRadius: 2 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#b45309' }}>
                INSTR: {order.delivery.instructions}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Items Table */}
        <View style={styles.itemTable}>
          <View style={styles.itemHeader}>
            <Text style={{ flex: 1 }}>ITEM DESCRIPTION</Text>
            {!isKitchen && <Text style={{ width: 60, textAlign: 'right' }}>TOTAL</Text>}
          </View>

          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>
                  {item.qty}x {item.name}
                </Text>
                {item.variants && item.variants.length > 0 && (
                  <Text style={styles.itemMeta}>• {item.variants.join(', ')}</Text>
                )}
                {item.specialNote && (
                  <Text style={styles.itemNote}>Note: &quot;{item.specialNote}&quot;</Text>
                )}
              </View>
              {!isKitchen && (
                <View style={styles.itemRight}>
                  <Text style={styles.itemTotal}>
                    {currencySymbol} {item.total.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 6, color: '#666666' }}>
                    @{item.unitPrice.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Totals Breakdown (Skip for Kitchen Dockets) */}
        {!isKitchen && (
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={{ color: '#666666' }}>Subtotal</Text>
              <Text>
                {currencySymbol} {order.subtotal.toLocaleString()}
              </Text>
            </View>

            {order.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#be123c', fontWeight: 'bold' }}>
                  Discount ({order.promoCode || 'PROMO'})
                </Text>
                <Text style={{ color: '#be123c', fontWeight: 'bold' }}>
                  -{currencySymbol} {order.discount.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={{ color: '#666666' }}>GST Tax ({tenant?.taxRate || 15}%)</Text>
              <Text>
                {currencySymbol} {order.tax.toLocaleString()}
              </Text>
            </View>

            {order.deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#666666' }}>Delivery Fee</Text>
                <Text>
                  {currencySymbol} {order.deliveryFee.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text>GRAND TOTAL</Text>
              <Text>
                {currencySymbol} {order.grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Box */}
        {!isKitchen && (
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentMethod}>Payment: {order.paymentMethod || 'Cash'}</Text>
            <Text
              style={[
                styles.paymentStatus,
                ['paid', 'completed'].includes(order.paymentStatus?.toLowerCase())
                  ? {}
                  : styles.unpaidStatus,
              ]}
            >
              Status: {order.paymentStatus || 'Paid'}
            </Text>
          </View>
        )}

        {/* Simulated Barcode decoration */}
        <View style={styles.barcode}>
          <View style={styles.barcodeLines}>
            <View style={{ width: 2, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 1, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 3, height: 14, backgroundColor: '#000000', marginRight: 2 }} />
            <View style={{ width: 1, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 2, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 1, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 4, height: 14, backgroundColor: '#000000', marginRight: 2 }} />
            <View style={{ width: 2, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 1, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 3, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
            <View style={{ width: 1, height: 14, backgroundColor: '#000000', marginRight: 1 }} />
          </View>
          <Text style={styles.barcodeText}>* {order.orderNumber.split('-').pop()} *</Text>
        </View>

        <View style={styles.heavyDivider} />

        {/* Footer info */}
        <View style={styles.footer}>
          {isKitchen ? (
            <Text style={styles.footerGreeting}>PREPARE SPECIALLY FOR CUSTOMER</Text>
          ) : tenant?.config?.receiptConfig?.footerMessage ? (
            tenant.config.receiptConfig.footerMessage.split('\n').map((line, idx) => (
              <Text key={`footer-${idx}`} style={styles.footerGreeting}>
                {line}
              </Text>
            ))
          ) : (
            <>
              <Text style={styles.footerGreeting}>
                {`Thank you for choosing ${tenant?.name || 'Indolj'}!`}
              </Text>
              <Text style={styles.footerTag}>Indolj Cloud Print • Core Engine</Text>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}
