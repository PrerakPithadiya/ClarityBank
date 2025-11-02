import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function ClarityBankLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn('size-6', props.className)}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m14.31 8 5.74 9.94" />
      <path d="M14.31 18H5.69" />
      <path d="m5.69 8 5.74 9.94" />
    </svg>
  );
}
