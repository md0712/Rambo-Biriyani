import { APP_CONFIG } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

/**
 * Generates a customer congratulatory order confirmation message and e-bill in plain text
 */
export const generateCustomerEbillText = (order) => {
  const customerName = order.customer || 'Valued Customer';
  const orderId = order.id || 'N/A';
  const date = order.date || new Date().toLocaleString('en-IN');
  const items = order.items || [];
  const total = Number(order.total) || 0;
  const paymentMethod = order.paymentMethod || 'Cash on Delivery';
  const address = order.shippingAddress || 'Takeaway Counter';
  const phone = order.customerPhone || 'N/A';

  const itemsList = items.length > 0
    ? items.map((item, idx) => `  ${idx + 1}. ${item.name} x ${item.quantity || 1} - ${formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}`).join('\n')
    : `  1. Delicious Dum Order - ${formatCurrency(total)}`;

  return `🎉 CONGRATULATIONS ${customerName.toUpperCase()}!
Your order has been placed successfully with ${APP_CONFIG.NAME}!

========================================
           RAMBO BIRIYANI E-BILL
========================================
Order ID        : #${orderId}
Date & Time     : ${date}
Customer Name   : ${customerName}
Phone Number    : ${phone}
Delivery Address: ${address}
Payment Mode    : ${paymentMethod}
Status          : ${order.status || 'Cooking on Dum'}

----------------------------------------
ORDERED ITEMS:
----------------------------------------
${itemsList}

----------------------------------------
BILL SUMMARY:
----------------------------------------
Subtotal        : ${formatCurrency(total)}
Delivery Fee    : ₹0 (FREE)
Taxes (GST)     : Included
----------------------------------------
GRAND TOTAL     : ${formatCurrency(total)}
========================================

🔥 Your authentic dum biriyani is now cooking fresh with firewood and royal spices. Our delivery warrior will arrive hot at your doorstep soon!

For assistance or tracking:
📞 Call: ${APP_CONFIG.CONTACT_PHONE}
💬 WhatsApp: https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}
📍 Kitchen: ${APP_CONFIG.ADDRESS}

Thank you for choosing ${APP_CONFIG.NAME}!
"BOLD FLAVOURS. NO MERCY."
`;
};

/**
 * Generates a customer congratulatory order confirmation e-bill in rich HTML format
 */
export const generateCustomerEbillHtml = (order) => {
  const customerName = order.customer || 'Valued Customer';
  const orderId = order.id || 'N/A';
  const date = order.date || new Date().toLocaleString('en-IN');
  const items = order.items || [];
  const total = Number(order.total) || 0;
  const paymentMethod = order.paymentMethod || 'Cash on Delivery';
  const address = order.shippingAddress || 'Takeaway Counter';

  const rows = items.length > 0
    ? items.map((item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: 600;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; text-align: right;">${formatCurrency(item.price || 0)}</td>
        <td style="padding: 10px; text-align: right; font-weight: 700;">${formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}</td>
      </tr>
    `).join('')
    : `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: 600;">Authentic Dum Biriyani Feast</td>
        <td style="padding: 10px; text-align: center;">1</td>
        <td style="padding: 10px; text-align: right;">${formatCurrency(total)}</td>
        <td style="padding: 10px; text-align: right; font-weight: 700;">${formatCurrency(total)}</td>
      </tr>
    `;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #111827; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; color: #e51e25; letter-spacing: 1px;">RAMBO BIRIYANI</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #9ca3af;">BOLD FLAVOURS. NO MERCY.</p>
      </div>

      <div style="background: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 18px 24px; text-align: center;">
        <h2 style="margin: 0 0 6px; color: #065f46; font-size: 20px;">🎉 Congratulations ${customerName}!</h2>
        <p style="margin: 0; color: #047857; font-size: 14px; font-weight: 500;">
          Your order has been placed successfully and is now cooking on dum!
        </p>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; font-size: 13px; margin-bottom: 20px; color: #475569;">
          <tr>
            <td><strong>Order ID:</strong> #${orderId}</td>
            <td style="text-align: right;"><strong>Date:</strong> ${date}</td>
          </tr>
          <tr>
            <td><strong>Payment:</strong> ${paymentMethod}</td>
            <td style="text-align: right;"><strong>Status:</strong> <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${order.status || 'Cooking on Dum'}</span></td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 6px;"><strong>Delivery Address:</strong> ${address}</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 14px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Subtotal:</span>
            <span style="font-weight: 600;">${formatCurrency(total)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Delivery Fee:</span>
            <span style="color: #10b981; font-weight: 600;">FREE</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
            <span>Grand Total:</span>
            <span style="color: #e51e25;">${formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 6px;">Need help with your delivery? Call <strong>${APP_CONFIG.CONTACT_PHONE}</strong></p>
        <p style="margin: 0;">${APP_CONFIG.ADDRESS}</p>
      </div>
    </div>
  `;
};

/**
 * Opens default email client (mailto) with pre-filled customer congratulations subject and e-bill body
 */
export const sendCustomerEbillEmail = (order, recipientEmail) => {
  const email = recipientEmail || order.customerEmail || '';
  const customerName = order.customer || 'Food Warrior';
  const subject = `🎉 Congratulations ${customerName}! Your Rambo Biriyani Order #${order.id} is Confirmed!`;
  const body = generateCustomerEbillText(order);

  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
  return true;
};

export default {
  generateCustomerEbillText,
  generateCustomerEbillHtml,
  sendCustomerEbillEmail,
};
