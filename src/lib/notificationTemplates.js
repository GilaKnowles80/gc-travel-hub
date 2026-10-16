/**
 * Shared notification message templates for all booking types, reservations,
 * and digital store orders. Used by backend functions and admin UI to create
 * consistent Notification records.
 */

const BOOKING_TYPE_LABELS = {
  flight: "Flight",
  hotel: "Hotel",
  tour: "Tour",
  ferry: "Ferry",
  bus: "Bus",
  car_rental: "Car Rental",
  visa: "Visa",
  cruise: "Cruise",
  train: "Train",
  package: "Travel Package",
  insurance: "Insurance",
  digital: "Digital Order",
  reservation: "Reservation",
};

const BOOKING_TYPE_ICONS = {
  flight: "✈️",
  hotel: "🏨",
  tour: "🗺️",
  ferry: "⛴️",
  bus: "🚌",
  car_rental: "🚗",
  visa: "🛂",
  cruise: "🚢",
  train: "🚆",
  package: "📦",
  insurance: "🛡️",
  digital: "🛍️",
  reservation: "📋",
};

/**
 * Build a notification object for a booking lifecycle event.
 *
 * @param {object} params
 * @param {string} params.bookingType  - one of BOOKING_TYPE_LABELS keys
 * @param {string} params.event        - created | confirmed | completed | cancelled | updated
 * @param {string} params.bookingId   - booking record id
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {number} params.amount
 * @param {string} params.currency
 * @param {string} [params.refSuffix] - human-readable ref (e.g. FB-0001)
 * @param {string} [params.link]      - deep link to the booking detail page
 * @returns {{title:string,message:string,type:string,booking_type:string,booking_id:string,link?:string}}
 */
export function buildBookingNotification({
  bookingType,
  event,
  bookingId,
  customerName,
  customerEmail,
  amount,
  currency = "USD",
  refSuffix,
  link,
}) {
  const label = BOOKING_TYPE_LABELS[bookingType] || "Booking";
  const icon = BOOKING_TYPE_ICONS[bookingType] || "🔔";
  const ref = refSuffix ? ` ${refSuffix}` : "";
  const amountStr = amount != null ? `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : null;

  const eventMap = {
    created: {
      type: "booking_created",
      title: `${icon} New ${label} Booking${ref}`,
      message: [
        `A new ${label.toLowerCase()} booking was created.`,
        customerName ? `Customer: ${customerName}` : null,
        customerEmail ? `Email: ${customerEmail}` : null,
        amountStr ? `Amount: ${amountStr}` : null,
        bookingId ? `Booking ID: ${bookingId}` : null,
      ].filter(Boolean).join("\n"),
    },
    confirmed: {
      type: "booking_confirmed",
      title: `✅ ${label} Confirmed${ref}`,
      message: [
        `Your ${label.toLowerCase()} booking has been confirmed.`,
        amountStr ? `Amount: ${amountStr}` : null,
        `We look forward to serving you!`,
      ].filter(Boolean).join("\n"),
    },
    completed: {
      type: "booking_completed",
      title: `🎉 ${label} Completed${ref}`,
      message: [
        `Your ${label.toLowerCase()} booking has been completed.`,
        `Thank you for choosing ArGie-C Travel & Tours!`,
        `We'd love to hear your feedback.`,
      ].filter(Boolean).join("\n"),
    },
    cancelled: {
      type: "booking_cancelled",
      title: `❌ ${label} Cancelled${ref}`,
      message: [
        `Your ${label.toLowerCase()} booking has been cancelled.`,
        amountStr ? `Refund amount: ${amountStr} (if applicable)` : null,
        `Contact support if you have questions.`,
      ].filter(Boolean).join("\n"),
    },
    updated: {
      type: "booking_updated",
      title: `📝 ${label} Updated${ref}`,
      message: [
        `Your ${label.toLowerCase()} booking has been updated.`,
        `Please review the changes in your bookings page.`,
      ].filter(Boolean).join("\n"),
    },
  };

  const tmpl = eventMap[event] || eventMap.created;
  return {
    title: tmpl.title,
    message: tmpl.message,
    type: tmpl.type,
    booking_type: bookingType,
    booking_id: bookingId,
    ...(link ? { link } : {}),
  };
}

/**
 * Build a notification for a reservation lifecycle event (admin-managed bookings).
 */
export function buildReservationNotification({ event, reservationId, customerName, status, link }) {
  const ref = reservationId ? ` ${reservationId.slice(-8).toUpperCase()}` : "";
  const eventMap = {
    confirmed: {
      type: "reservation_confirmed",
      title: `📋 Reservation Confirmed${ref}`,
      message: [
        `Your reservation has been confirmed by our team.`,
        customerName ? `Guest: ${customerName}` : null,
        `Status: ${status || "Confirmed"}`,
      ].filter(Boolean).join("\n"),
    },
    cancelled: {
      type: "reservation_cancelled",
      title: `❌ Reservation Cancelled${ref}`,
      message: [
        `Your reservation has been cancelled.`,
        `Please contact support if you have questions.`,
      ].filter(Boolean).join("\n"),
    },
    updated: {
      type: "reservation_updated",
      title: `📝 Reservation Updated${ref}`,
      message: [
        `Your reservation details have been updated.`,
        `Status: ${status || "Updated"}`,
      ].filter(Boolean).join("\n"),
    },
  };

  const tmpl = eventMap[event] || eventMap.confirmed;
  return {
    title: tmpl.title,
    message: tmpl.message,
    type: tmpl.type,
    booking_type: "reservation",
    booking_id: reservationId,
    ...(link ? { link } : {}),
  };
}

/**
 * Build a notification for a digital store order lifecycle event.
 */
export function buildOrderNotification({ event, orderId, productTitles, amount, currency = "USD", downloadLink, link }) {
  const ref = orderId ? ` ${orderId.slice(-8).toUpperCase()}` : "";
  const productSummary = productTitles?.length ? productTitles.join(", ") : "Digital products";
  const amountStr = amount != null ? `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : null;

  const eventMap = {
    created: {
      type: "order_created",
      title: `🛍️ New Digital Order${ref}`,
      message: [
        `Your digital order has been placed.`,
        `Products: ${productSummary}`,
        amountStr ? `Amount: ${amountStr}` : null,
        `You'll receive download links once payment is confirmed.`,
      ].filter(Boolean).join("\n"),
    },
    completed: {
      type: "order_completed",
      title: `✅ Order Ready${ref}`,
      message: [
        `Your digital order is ready!`,
        `Products: ${productSummary}`,
        downloadLink ? `Download: ${downloadLink}` : `Check your email for download links.`,
      ].filter(Boolean).join("\n"),
    },
    shipped: {
      type: "order_shipped",
      title: `📧 Download Links Sent${ref}`,
      message: [
        `Download links for your order have been emailed.`,
        `Products: ${productSummary}`,
      ].filter(Boolean).join("\n"),
    },
    cancelled: {
      type: "order_cancelled",
      title: `❌ Order Cancelled${ref}`,
      message: [
        `Your digital order has been cancelled.`,
        amountStr ? `Refund: ${amountStr} (if applicable)` : null,
      ].filter(Boolean).join("\n"),
    },
  };

  const tmpl = eventMap[event] || eventMap.created;
  return {
    title: tmpl.title,
    message: tmpl.message,
    type: tmpl.type,
    booking_type: "digital",
    booking_id: orderId,
    ...(link ? { link } : {}),
  };
}

/**
 * Build a checkout payment notification for admin (used by notifyCheckoutPayment).
 */
export function buildCheckoutPaymentNotification({
  bookingType,
  bookingId,
  amount,
  currency = "USD",
  paymentMode,
  customerName,
  customerEmail,
  referenceNo,
}) {
  const label = BOOKING_TYPE_LABELS[bookingType] || "Booking";
  const ref = bookingId ? ` (${bookingId.slice(-8).toUpperCase()})` : "";
  const amountStr = `${currency} ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const modeLabel = paymentMode === "paypal_qr"
    ? "PayPal QR Code (Manual)"
    : paymentMode === "paypal_email"
    ? "PayPal Email Transfer (Manual)"
    : paymentMode === "paypal_automatic"
    ? "PayPal (Automatic Checkout)"
    : paymentMode;

  const isManual = paymentMode?.startsWith("paypal_") && !paymentMode?.includes("automatic");

  return {
    title: `New Checkout: ${label}${ref} — ${modeLabel}`,
    message: [
      `A customer completed checkout via ${modeLabel}.`,
      ``,
      `Booking Type: ${label}`,
      bookingId ? `Booking ID: ${bookingId}` : null,
      `Amount: ${amountStr}`,
      customerName ? `Customer: ${customerName}` : null,
      customerEmail ? `Customer Email: ${customerEmail}` : null,
      referenceNo ? `PayPal Reference No: ${referenceNo}` : null,
      ``,
      isManual
        ? `Action needed: Verify the PayPal payment before confirming the booking.`
        : `Payment captured automatically. Please review in the admin dashboard.`,
    ].filter(Boolean).join("\n"),
    type: "checkout_payment",
    booking_type: bookingType,
    booking_id: bookingId,
  };
}

export { BOOKING_TYPE_LABELS, BOOKING_TYPE_ICONS };