import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { HEALING_CHECK_TEMPLATE } from '@/lib/email/templates';
import { subDays, format } from 'date-fns';

// CRON JOB: Runs daily (e.g., 10:00 AM)
// Vercel Cron Secret should be checked if critical, simplified here.
export async function GET(request: NextRequest) {
    // 1. Check Authorization (Simple Secret Header)
    // 1. Check Authorization (Simple Secret Header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createAdminClient();
    
    // 2. Find eligible bookings:
    // - Status = CONFIRMED (or COMPLETED? Let's say CONFIRMED/COMPLETED)
    // - Date = 3 days ago
    // - metadata->feedback_email_sent IS NULL (or false)
    
    const threeDaysAgo = subDays(new Date(), 3);
    const dateStr = format(threeDaysAgo, 'yyyy-MM-dd');

    console.log(`🔍 Cron: Checking for bookings on ${dateStr}...`);

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', dateStr)
        // .eq('status', 'CONFIRMED') // Let's check all verified bookings
        .is('metadata->feedback_email_sent', null); // Or check keys inside logic if filtering is hard

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
        return NextResponse.json({ message: 'No emails to send today.' });
    }

    console.log(`📧 Found ${bookings.length} clients to email.`);
    
    const results = [];

    for (const booking of bookings) {
        // Double check status if needed
        if (booking.status === 'CANCELLED') continue;

        // Send Email
        const html = HEALING_CHECK_TEMPLATE(booking.client_name);
        const emailRes = await sendEmail({
            to: booking.client_email,
            subject: 'Altus Ink - Como está a cicatrização?',
            html
        });

        if (emailRes.success) {
            // Update DB to prevent duplicate
            await supabase
                .from('bookings')
                .update({
                    metadata: {
                        ...booking.metadata,
                        feedback_email_sent: true,
                        sent_at: new Date().toISOString()
                    }
                })
                .eq('id', booking.id);
            
            results.push({ id: booking.id, status: 'sent' });
        } else {
            results.push({ id: booking.id, status: 'failed', error: emailRes.error });
        }
    }

    return NextResponse.json({ processed: results.length, details: results });
}
