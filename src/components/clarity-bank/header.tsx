'use client';

import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClarityBankLogo } from './clarity-bank-logo';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '';
    return `${firstName[0]}${lastName[0]}`;
  };

  return (
    <header className="flex items-center justify-between gap-3 py-6 md:py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <ClarityBankLogo className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          ClarityBank
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {user && !isUserLoading && (
          <>
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Avatar>
                <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
