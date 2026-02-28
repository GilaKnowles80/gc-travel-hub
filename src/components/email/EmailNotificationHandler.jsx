import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function EmailNotificationHandler({
  triggerType,
  bookingType,
  bookingId,
  customerEmail,
  customerName,
  transactionId,
  amount,
  itineraryData
}) {
  useEffect(() => {
    const sendNotification = async () => {
      try {
        if (triggerType === 'booking_confirmation') {
          await base44.functions.invoke('sendBookingConfirmationGmail', {
            bookingType,
            bookingId,
            customerEmail,
            customerName
          });
        } else if (triggerType === 'payment_receipt') {
          await base44.functions.invoke('sendPaymentReceiptGmail', {
            bookingType,
            bookingId,
            customerEmail,
            customerName,
            transactionId,
            amount
          });
        } else if (triggerType === 'itinerary_update') {
          await base44.functions.invoke('sendItineraryUpdateGmail', {
            itineraryId: itineraryData?.id,
            customerEmail,
            customerName,
            itineraryTitle: itineraryData?.title,
            destination: itineraryData?.destination,
            startDate: itineraryData?.start_date,
            endDate: itineraryData?.end_date,
            itemCount: itineraryData?.items?.length || 0
          });
        }
      } catch (error) {
        console.error('Email notification failed:', error);
      }
    };

    if (triggerType && customerEmail) {
      sendNotification();
    }
  }, [triggerType, bookingId, customerEmail]);

  return null;
}