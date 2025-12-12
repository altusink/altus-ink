// Deposit release job - runs periodically to release deposits after retention period
// Deposits transition: held -> available -> released

import { storage } from '../storage';

export async function releaseMaturedDeposits(): Promise<{
  released: number;
  errors: number;
}> {
  console.log('[job] Starting deposit release check...');
  
  let released = 0;
  let errors = 0;
  
  try {
    // Get all deposits that are past retention period and still held
    const deposits = await storage.getDepositsForRelease();
    
    for (const deposit of deposits) {
      try {
        await storage.updateDepositStatus(deposit.id, 'available');
        released++;
        console.log(`[job] Released deposit ${deposit.id} - ${deposit.currency} ${deposit.amount}`);
      } catch (error) {
        errors++;
        console.error(`[job] Failed to release deposit ${deposit.id}:`, error);
      }
    }
    
    console.log(`[job] Deposit release complete. Released: ${released}, Errors: ${errors}`);
  } catch (error) {
    console.error('[job] Error in deposit release job:', error);
  }
  
  return { released, errors };
}

// Start the job on a schedule (runs every hour)
export function startDepositReleaseJob() {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  
  console.log('[job] Deposit release job scheduled (hourly)');
  
  // Run immediately on startup
  releaseMaturedDeposits();
  
  // Then run every hour
  setInterval(() => {
    releaseMaturedDeposits();
  }, INTERVAL_MS);
}
