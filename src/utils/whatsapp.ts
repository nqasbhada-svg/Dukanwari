import { Invoice, ShopSettings } from '../types';

/**
 * Robustly interpolates variables within a template string.
 * Supports standard placeholders like {customerName}, {grandTotal}, {invoiceNumber}, {shopName}, {link}, {itemsCount}, {paymentMode}.
 */
export function interpolateWhatsAppTemplate(
  template: string,
  variables: {
    customerName: string;
    grandTotal: number | string;
    invoiceNumber: string;
    shopName: string;
    itemsCount: number | string;
    paymentMode: string;
    link: string;
  }
): string {
  let text = template;
  
  // Replace brackets tags in the format of {tagName}
  text = text.replace(/{customerName}/gi, variables.customerName);
  text = text.replace(/{client}/gi, variables.customerName);
  text = text.replace(/{grandTotal}/gi, String(variables.grandTotal));
  text = text.replace(/{amt}/gi, String(variables.grandTotal));
  text = text.replace(/{invoiceNumber}/gi, variables.invoiceNumber);
  text = text.replace(/{invNo}/gi, variables.invoiceNumber);
  text = text.replace(/{shopName}/gi, variables.shopName);
  text = text.replace(/{shop}/gi, variables.shopName);
  text = text.replace(/{itemsCount}/gi, String(variables.itemsCount));
  text = text.replace(/{paymentMode}/gi, variables.paymentMode);
  text = text.replace(/{link}/gi, variables.link);

  return text;
}

/**
 * Generates the pre-filled text message body for a given billing event type.
 * Supports Invoice delivery, Order Summary, Credit Payment reminders, and Special Promo Offers.
 */
export function getWhatsAppBillingMessage(
  type: 'invoice' | 'summary' | 'reminder' | 'offer',
  invoice: Invoice | null,
  settings: ShopSettings,
  previewBaseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-dgftlp6oy2gnxl5x5ge4mb-98013956105.asia-southeast1.run.app',
  extraCustomerDetails?: { name: string; outstanding: number; mobile: string }
): string {
  // Extract info from invoice if present, else fallback to customer details
  const customerName = invoice ? invoice.customerName : (extraCustomerDetails?.name || 'Customer');
  const grandTotal = invoice ? invoice.grandTotal : (extraCustomerDetails?.outstanding || 0);
  const invoiceNumber = invoice ? invoice.invoiceNumber : 'N/A';
  const shopName = settings.shopName;
  const itemsCount = invoice ? invoice.items.length : 0;
  const paymentMode = invoice ? invoice.paymentMode : 'N/A';
  const link = invoice ? `${previewBaseUrl}/#/invoice-preview/${invoice.invoiceNumber}` : `${previewBaseUrl}/#/outstanding-view`;

  const vars = {
    customerName,
    grandTotal,
    invoiceNumber,
    shopName,
    itemsCount,
    paymentMode,
    link
  };

  switch (type) {
    case 'invoice': {
      const template = settings.templateInvoice || 'Hello {customerName}, your digital invoice from *{shopName}* is ready. Amount: *₹{grandTotal}*. View PDF: {link}. Thank you!';
      return interpolateWhatsAppTemplate(template, vars);
    }
    case 'summary': {
      return `Order Summary from *${shopName}* for ${customerName}. Items: ${itemsCount} products purchased. Total Bill: *₹${grandTotal}*. Paid via: ${paymentMode}.`;
    }
    case 'reminder': {
      const template = settings.templateReminder || 'Dear {customerName}, this is a gentle reminder regarding outstanding invoice *{invoiceNumber}* from *${shopName}* of amount *₹{grandTotal}*. Please clear via UPI.';
      return interpolateWhatsAppTemplate(template, vars);
    }
    case 'offer': {
      const template = settings.templateOffer || 'Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts on our latest product collections. Visit us today!';
      return interpolateWhatsAppTemplate(template, vars);
    }
    default:
      return '';
  }
}

/**
 * Cleans the input mobile number to strip non-numeric characters and prepends the '91' country code
 * if it represents a 10-digit Indian local number.
 */
export function cleanWhatsAppPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Constructs a secure wa.me URL with pre-filled billing summaries and triggers it to open in a new tab.
 */
export function openWhatsAppBillingShare(
  type: 'invoice' | 'summary' | 'reminder' | 'offer',
  invoice: Invoice | null,
  settings: ShopSettings,
  previewBaseUrl?: string,
  extraCustomerDetails?: { name: string; outstanding: number; mobile: string }
): string {
  const message = getWhatsAppBillingMessage(type, invoice, settings, previewBaseUrl, extraCustomerDetails);
  const text = encodeURIComponent(message);
  
  const rawPhone = invoice ? invoice.customerMobile : (extraCustomerDetails?.mobile || '');
  const formattedPhone = cleanWhatsAppPhone(rawPhone);
  const waUrl = `https://wa.me/${formattedPhone}?text=${text}`;

  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  return waUrl;
}
