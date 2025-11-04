
'use server';

import { firestore } from 'firebase-admin';
import { BADGES } from '@/lib/badges';
import type { BankAccount, Transaction, EarnedBadge, BadgeId } from '@/lib/types';
import { getFirebaseAdmin } from '@/firebase-admin'; // Assuming you have an admin setup

/**
 * Checks for and awards new badges to a user.
 * This is designed to be called from a server environment (e.g., a Firebase Function or server-side cron).
 */
export async function checkAndAwardBadges(
  userId: string,
  transactions: Transaction[],
  account: BankAccount
): Promise<EarnedBadge[]> {
    const { db } = getFirebaseAdmin();
    const earnedBadgesRef = db.collection(`users/${userId}/badges`);
    const snapshot = await earnedBadgesRef.get();
    const existingBadgeIds = snapshot.docs.map(doc => doc.id as BadgeId);
    
    const newlyEarnedBadges: EarnedBadge[] = [];

    for (const badge of BADGES) {
        if (!existingBadgeIds.includes(badge.id)) {
            const isEarned = badge.check(transactions, account);
            if (isEarned) {
                const earnedBadgeData: Omit<EarnedBadge, 'id' | 'icon'> & { dateEarned: firestore.FieldValue } = {
                    name: badge.name,
                    description: badge.description,
                    dateEarned: firestore.FieldValue.serverTimestamp(),
                };
                // Award the badge by setting it in Firestore
                await earnedBadgesRef.doc(badge.id).set(earnedBadgeData);
                newlyEarnedBadges.push({ ...badge, dateEarned: new Date().toISOString() });
            }
        }
    }

    return newlyEarnedBadges;
}
