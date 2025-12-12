// Stripe webhook handlers for ALTUSINK.IO
// Handles payment confirmations and booking status updates

import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { PLATFORM_FEE_PERCENTAGE, DEPOSIT_RETENTION_DAYS } from '@shared/schema';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    
    // Process webhook with stripe-replit-sync
    await sync.processWebhook(payload, signature, uuid);
    
    // Also handle our custom business logic
    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      await getWebhookSecret(uuid)
    );
    
    await handleStripeEvent(event);
  }
}

async function getWebhookSecret(uuid: string): Promise<string> {
  const sync = await getStripeSync();
  const webhookEndpoint = await sync.getManagedWebhookByUuid(uuid);
  
  if (!webhookEndpoint || !webhookEndpoint.secret) {
    console.error(`[stripe] SECURITY: No webhook secret found for UUID ${uuid}`);
    throw new Error('Webhook secret not configured - cannot verify signature');
  }
  
  return webhookEndpoint.secret;
}

async function handleStripeEvent(event: any) {
  console.log(`[stripe] Processing event: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    default:
      console.log(`[stripe] Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(session: any) {
  const { metadata, payment_intent, amount_total, currency } = session;
  
  if (!metadata?.lockId) {
    console.log('[stripe] No lockId in session metadata, skipping');
    return;
  }
  
  const lockId = metadata.lockId;
  
  try {
    // IDEMPOTENCY: Check if booking already exists for this lock
    const existingBooking = await storage.getBookingByLockId(lockId);
    if (existingBooking) {
      console.log(`[stripe] Booking already exists for lock ${lockId}, skipping (idempotent)`);
      return;
    }
    
    // IDEMPOTENCY: Check if payment already exists for this payment intent
    if (payment_intent) {
      const existingPayment = await storage.getPaymentByIntentId(payment_intent);
      if (existingPayment) {
        console.log(`[stripe] Payment ${payment_intent} already processed, skipping (idempotent)`);
        return;
      }
    }
    
    // Get the booking lock
    const lock = await storage.getBookingLock(lockId);
    if (!lock) {
      console.error(`[stripe] Lock ${lockId} not found`);
      return;
    }
    
    // Check lock status - if already confirmed, this is a duplicate
    if (lock.status === 'confirmed') {
      console.log(`[stripe] Lock ${lockId} already confirmed, skipping (idempotent)`);
      return;
    }
    
    // Confirm the lock
    await storage.confirmBookingLock(lockId);
    
    // Create the confirmed booking
    const booking = await storage.createBooking({
      artistId: lock.artistId,
      lockId: lock.id,
      customerName: lock.customerName,
      customerEmail: lock.customerEmail,
      customerPhone: lock.customerPhone || undefined,
      customerInstagram: lock.customerInstagram || undefined,
      slotDatetime: lock.slotDatetime,
      durationMinutes: lock.durationMinutes || 60,
      depositAmount: String((amount_total || 0) / 100),
      currency: currency?.toUpperCase() || 'EUR',
      referenceImageUrl: lock.referenceImageUrl || undefined,
      tattooDescription: lock.tattooDescription || undefined,
      authorizePortfolio: lock.authorizePortfolio || false,
      status: 'confirmed',
    });
    
    // Create deposit record with 70/30 split
    const depositAmount = (amount_total || 0) / 100;
    const platformFee = depositAmount * PLATFORM_FEE_PERCENTAGE;
    const artistAmount = depositAmount * (1 - PLATFORM_FEE_PERCENTAGE);
    
    const retentionUntil = new Date();
    retentionUntil.setDate(retentionUntil.getDate() + DEPOSIT_RETENTION_DAYS);
    
    await storage.createDeposit({
      artistId: lock.artistId,
      bookingId: booking.id,
      amount: depositAmount.toFixed(2),
      currency: currency?.toUpperCase() || 'EUR',
      platformFee: platformFee.toFixed(2),
      artistAmount: artistAmount.toFixed(2),
      isRefundable: false,
      status: 'held',
      retentionUntil,
    });
    
    // Create payment record
    await storage.createPayment({
      artistId: lock.artistId,
      bookingId: booking.id,
      lockId: lock.id,
      amount: depositAmount.toFixed(2),
      currency: currency?.toUpperCase() || 'EUR',
      paymentMethod: 'stripe',
      paymentIntentId: payment_intent,
      status: 'completed',
    });
    
    console.log(`[stripe] Booking ${booking.id} confirmed with payment ${payment_intent}`);
    
    // TODO: Send confirmation email/WhatsApp
    
  } catch (error) {
    console.error('[stripe] Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log(`[stripe] Payment succeeded: ${paymentIntent.id}`);
  // Additional logic if needed
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log(`[stripe] Payment failed: ${paymentIntent.id}`);
  
  const { metadata } = paymentIntent;
  if (metadata?.lockId) {
    // Release the lock so the slot becomes available again
    try {
      await storage.expireBookingLock(metadata.lockId);
      console.log(`[stripe] Released lock ${metadata.lockId} due to payment failure`);
    } catch (error) {
      console.error('[stripe] Error releasing lock:', error);
    }
  }
}
