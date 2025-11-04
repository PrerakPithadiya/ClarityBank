
'use client';

import { BADGES } from '@/lib/badges';
import type { BankAccount, Transaction, EarnedBadge, User } from '@/lib/types';

/**
 * A client-side function to determine which badges have been earned without writing to Firestore.
 * This is used for immediate UI feedback.
 */
export function getEarnedBadgesFromActivity(
    transactions: Transaction[],
    account: BankAccount,
    user: User | null,
    hasDownloadedReceipt?: boolean
): EarnedBadge[] {
    const earnedBadges: EarnedBadge[] = [];
    if (!account) return [];

    for (const badge of BADGES) {
        // Pass the optional hasDownloadedReceipt flag to the check function
        const isEarned = badge.check(transactions, account, user, hasDownloadedReceipt);
        if (isEarned) {
            earnedBadges.push({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                dateEarned: new Date().toISOString(), // Date is for display only
            });
        }
    }
    return earnedBadges;
}
