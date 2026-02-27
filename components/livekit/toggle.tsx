'use client';

import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-full',
    'text-sm font-medium whitespace-nowrap',
    'cursor-pointer outline-none transition-all duration-300',
    'hover:scale-105 active:scale-95',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:ring-[oklch(0.7_0.2_280)] focus-visible:ring-[3px] focus-visible:ring-offset-2',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-[oklch(0.92_0.05_280)]',
        primary: [
          'bg-[oklch(0.92_0.05_280)] text-[oklch(0.65_0.2_25)]',
          'hover:bg-[oklch(0.88_0.08_280)]',
          'data-[state=on]:bg-[oklch(0.85_0.15_150)] data-[state=on]:text-[oklch(0.25_0.1_150)]',
        ],
        secondary: [
          'bg-[oklch(0.92_0.05_280)] text-[oklch(0.4_0.1_280)]',
          'hover:bg-[oklch(0.88_0.08_280)]',
          'data-[state=on]:bg-gradient-to-r data-[state=on]:from-[oklch(0.75_0.15_240)] data-[state=on]:to-[oklch(0.7_0.18_260)]',
          'data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:shadow-[oklch(0.7_0.15_240/0.3)]',
        ],
        outline: [
          'border-2 border-[oklch(0.85_0.1_280)] bg-white/80',
          'hover:bg-[oklch(0.95_0.05_280)] hover:border-[oklch(0.75_0.15_280)]',
          'data-[state=on]:border-[oklch(0.65_0.25_280)] data-[state=on]:bg-[oklch(0.9_0.1_280)]',
        ],
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-9 gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-11 px-7 has-[>svg]:px-5',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
