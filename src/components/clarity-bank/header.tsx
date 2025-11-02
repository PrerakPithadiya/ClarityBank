import { ClarityBankLogo } from './clarity-bank-logo';

export function Header() {
  return (
    <header className="flex items-center gap-3 py-6 md:py-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <ClarityBankLogo className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">ClarityBank</h1>
    </header>
  );
}
