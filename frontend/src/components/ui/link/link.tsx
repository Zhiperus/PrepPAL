import { Link as RouterLink } from 'react-router';
import type { LinkProps } from 'react-router';

import { cn } from '@/utils/cn';

export function Link({ className, children, ...props }: LinkProps) {
  return (
    <RouterLink
      className={cn('text-slate-600 hover:text-slate-900', className)}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
