import {Resend} from "resend";
import {defineSecret} from "firebase-functions/params";

export const resendApiKey = defineSecret("RESEND_API_KEY");

const FROM = "Dear Momollie <orders@momollie.me>";
const BRAND_BROWN = "#3E2C1F";
const BRAND_GOLD = "#E8B55F";
const BRAND_CREAM = "#FAF8F4";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  salePrice?: number;
}

export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  subtotal: number;
  total: number;
  shippingTier: "standard" | "priority";
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface ShippingNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  trackingNumber: string;
  trackingUrl?: string;
  shippingTier: "standard" | "priority";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(dollars: number) {
  return `$${dollars.toFixed(2)}`;
}

function itemRows(items: OrderEmailItem[]) {
  return items
    .map((item) => {
      const unitPrice = item.salePrice ?? item.price;
      const line = unitPrice * item.quantity;
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #EDE8E1;font-size:14px;color:#2D1F14;">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #EDE8E1;font-size:14px;color:#6B5744;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #EDE8E1;font-size:14px;color:#2D1F14;text-align:right;">${fmt(line)}</td>
        </tr>`;
    })
    .join("");
}

function emailShell(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#F5F0EA;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EA;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_BROWN};padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#fff;letter-spacing:1px;">Dear Momollie</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">Handcrafted with love</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;background:${BRAND_CREAM};">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:${BRAND_BROWN};padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">© ${new Date().getFullYear()} Dear Momollie · momollie.me</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">Questions? Reply to this email or visit momollie.me</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Order confirmation
// ---------------------------------------------------------------------------

export async function sendOrderConfirmation(
  apiKey: string,
  data: OrderConfirmationData
): Promise<void> {
  const resend = new Resend(apiKey);
  const shippingCost = Math.max(0, data.total - data.subtotal);
  const deliveryRange =
    data.shippingTier === "priority" ? "1–3 business days" : "3–7 business days";
  const shortId = data.orderId.slice(0, 8).toUpperCase();

  const addrLine2 = data.address.line2 ? `<br>${data.address.line2}` : "";

  const body = `
    <h1 style="margin:0 0 4px;font-size:24px;color:${BRAND_BROWN};">Order Confirmed</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B5744;">Hi ${data.customerName} — thank you for your order!</p>

    <div style="background:#fff;border:1px solid #EDE8E1;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#9B8778;text-transform:uppercase;letter-spacing:1px;">Order number</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:${BRAND_BROWN};letter-spacing:2px;">#${shortId}</p>
    </div>

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid ${BRAND_BROWN};font-size:12px;color:#9B8778;text-align:left;text-transform:uppercase;letter-spacing:1px;">Item</th>
          <th style="padding:8px 0;border-bottom:2px solid ${BRAND_BROWN};font-size:12px;color:#9B8778;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="padding:8px 0;border-bottom:2px solid ${BRAND_BROWN};font-size:12px;color:#9B8778;text-align:right;text-transform:uppercase;letter-spacing:1px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(data.items)}
      </tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#6B5744;">Subtotal</td>
        <td style="padding:4px 0;font-size:14px;color:#6B5744;text-align:right;">${fmt(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#6B5744;">Shipping (${data.shippingTier})</td>
        <td style="padding:4px 0;font-size:14px;color:#6B5744;text-align:right;">${fmt(shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:16px;font-weight:bold;color:${BRAND_BROWN};border-top:1px solid #EDE8E1;">Total</td>
        <td style="padding:10px 0 0;font-size:16px;font-weight:bold;color:${BRAND_BROWN};text-align:right;border-top:1px solid #EDE8E1;">${fmt(data.total)}</td>
      </tr>
    </table>

    <!-- Shipping address + delivery -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:16px;">
          <p style="margin:0 0 6px;font-size:12px;color:#9B8778;text-transform:uppercase;letter-spacing:1px;">Ship to</p>
          <p style="margin:0;font-size:14px;color:#2D1F14;line-height:1.6;">
            ${data.customerName}<br>
            ${data.address.line1}${addrLine2}<br>
            ${data.address.city}, ${data.address.state} ${data.address.zip}<br>
            ${data.address.country}
          </p>
        </td>
        <td width="50%" style="vertical-align:top;">
          <p style="margin:0 0 6px;font-size:12px;color:#9B8778;text-transform:uppercase;letter-spacing:1px;">Estimated delivery</p>
          <p style="margin:0;font-size:14px;color:#2D1F14;">${deliveryRange}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#9B8778;">We'll email you when your order ships with tracking information.</p>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order confirmed — #${shortId}`,
    html: emailShell("Order Confirmed", body),
  });
}

// ---------------------------------------------------------------------------
// Shipping notification
// ---------------------------------------------------------------------------

export async function sendShippingNotification(
  apiKey: string,
  data: ShippingNotificationData
): Promise<void> {
  const resend = new Resend(apiKey);
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const deliveryRange =
    data.shippingTier === "priority" ? "1–3 business days" : "3–7 business days";

  const trackingButton = data.trackingUrl
    ? `<a href="${data.trackingUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background-color:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">Track Your Package</a>`
    : "";

  const body = `
    <h1 style="margin:0 0 4px;font-size:24px;color:${BRAND_BROWN};">Your order is on its way!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B5744;">Hi ${data.customerName} — your Momollie order has shipped.</p>

    <!-- Tracking box -->
    <div style="background:#fff;border:1px solid #EDE8E1;border-radius:6px;padding:20px 24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#9B8778;text-transform:uppercase;letter-spacing:1px;">USPS Tracking Number</p>
      <p style="margin:0;font-size:22px;font-weight:bold;color:${BRAND_BROWN};letter-spacing:2px;font-family:monospace;">${data.trackingNumber}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#9B8778;">Estimated delivery: ${deliveryRange}</p>
      ${trackingButton}
    </div>

    <!-- Items shipped -->
    <p style="margin:0 0 10px;font-size:13px;color:#9B8778;text-transform:uppercase;letter-spacing:1px;">What's in this shipment</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid ${BRAND_BROWN};font-size:12px;color:#9B8778;text-align:left;text-transform:uppercase;letter-spacing:1px;">Item</th>
          <th style="padding:8px 0;border-bottom:2px solid ${BRAND_BROWN};font-size:12px;color:#9B8778;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="padding:8px 0;border-bottom:2px solid ${BRAND_BROWN};font-size:12px;color:#9B8778;text-align:right;text-transform:uppercase;letter-spacing:1px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(data.items)}
      </tbody>
    </table>

    <p style="margin:0;font-size:13px;color:#9B8778;">Order <strong style="color:${BRAND_BROWN};">#${shortId}</strong> · Questions? Just reply to this email.</p>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Your Momollie order has shipped — tracking #${data.trackingNumber}`,
    html: emailShell("Your Order Has Shipped", body),
  });
}
