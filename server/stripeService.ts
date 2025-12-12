// Stripe service for ALTUSINK.IO booking payments
// Handles checkout session creation for tattoo booking deposits

import { getUncachableStripeClient, getStripePublishableKey, isStripeConfigured } from './stripeClient';
import type { Artist, BookingLock } from '@shared/schema';

export class StripeService {
  // Create checkout session for booking deposit
  async createBookingCheckoutSession(
    artist: Artist,
    lock: BookingLock,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string; sessionId: string }> {
    const stripe = await getUncachableStripeClient();
    
    const depositAmount = Number(artist.depositAmount || 100);
    const currency = (artist.currency || 'EUR').toLowerCase();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(depositAmount * 100), // Convert to cents
            product_data: {
              name: `Tattoo Deposit - ${artist.displayName}`,
              description: `Booking deposit for ${new Date(lock.slotDatetime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              images: artist.coverImageUrl ? [artist.coverImageUrl] : [],
            },
          },
          quantity: 1,
        },
      ],
      customer_email: lock.customerEmail,
      metadata: {
        lockId: lock.id,
        artistId: artist.id,
        slotDatetime: lock.slotDatetime.toISOString(),
        customerName: lock.customerName,
        customerEmail: lock.customerEmail,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 600, // 10 minutes to match lock expiry
    });
    
    return {
      url: session.url!,
      sessionId: session.id,
    };
  }
  
  // Get publishable key for frontend
  async getPublishableKey(): Promise<string> {
    return await getStripePublishableKey();
  }
  
  // Check if Stripe is configured
  async isConfigured(): Promise<boolean> {
    return await isStripeConfigured();
  }
  
  // Create refund for cancelled booking
  async createRefund(paymentIntentId: string, reason: string): Promise<any> {
    const stripe = await getUncachableStripeClient();
    
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: { reason },
    });
  }
}

export const stripeService = new StripeService();
