
import banks from './banks.json';
import type { Bank } from './types';

const allBanks: Bank[] = banks.flatMap(group => group.banks);

export function getBankInfo(bankId: string): Bank | undefined {
    return allBanks.find(b => b.id === bankId);
}

export default banks;
