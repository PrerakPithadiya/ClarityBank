
'use server';

import { firestore } from 'firebase-admin';
import { BADGES } from '@/lib/badges';
import type { BankAccount, Transaction, EarnedBadge, BadgeId } from '@/lib/types';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '@/firebase-admin'; // Assuming you have an admin setup

/**
 * Checks for and awards new badges to a user.
 * This is designed to be called from a server environment (e.g., a Firebase Function or server-side cron).
 * NOTE: For this demo, we're calling it from the client, which is not ideal for production.
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
                const earnedBadge: Omit<EarnedBadge, 'id'> = {
                    name: badge.name,
                    description: badge.description,
                    icon: badge.icon, // Storing name, can be retrieved on client
                    dateEarned: new Date().toISOString(),
                };
                // Award the badge by setting it in Firestore
                await earnedBadgesRef.doc(badge.id).set(earnedBadge);
                newlyEarnedBadges.push({ ...earnedBadge, id: badge.id });
            }
        }
    }

    return newlyEarnedBadges;
}

/**
 * A client-side function to determine which badges have been earned without writing to Firestore.
 * This is used for immediate UI feedback.
 */
export function getEarnedBadgesFromActivity(
    transactions: Transaction[],
    account: BankAccount
): EarnedBadge[] {
    const earnedBadges: EarnedBadge[] = [];
    if (!account) return [];

    for (const badge of BADGES) {
        const isEarned = badge.check(transactions, account);
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
