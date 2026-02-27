import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'text-xs font-bold tracking-wider uppercase whitespace-nowrap',
    'inline-flex items-center justify-center gap-2 shrink-0 rounded-full cursor-pointer outline-none transition-all duration-300',
    'focus-visible:ring-[oklch(0.7_0.2_280)] focus-visible:ring-[3px] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'transform hover:scale-105 active:scale-95',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          'bg-[oklch(0.92_0.05_280)] text-[oklch(0.3_0.1_280)] hover:bg-[oklch(0.88_0.08_280)] shadow-sm',
        destructive: [
          'bg-gradient-to-r from-[oklch(0.7_0.2_25)] to-[oklch(0.65_0.22_15)] text-white',
          'hover:from-[oklch(0.65_0.22_25)] hover:to-[oklch(0.6_0.24_15)]',
          'shadow-md shadow-[oklch(0.7_0.2_25/0.3)]',
        ],
        outline: [
          'border-2 border-[oklch(0.8_0.15_280)] bg-white/80',
          'hover:bg-[oklch(0.95_0.05_280)] hover:border-[oklch(0.7_0.2_280)]',
          'text-[oklch(0.4_0.1_280)]',
        ],
        primary: [
          'bg-gradient-to-r from-[oklch(0.65_0.25_280)] to-[oklch(0.6_0.27_300)] text-white',
          'hover:from-[oklch(0.6_0.27_280)] hover:to-[oklch(0.55_0.29_300)]',
          'shadow-md shadow-[oklch(0.65_0.25_280/0.4)]',
        ],
        secondary: [
          'bg-[oklch(0.92_0.06_200)] text-[oklch(0.35_0.1_200)]',
          'hover:bg-[oklch(0.88_0.08_200)]',
          'shadow-sm',
        ],
        ghost: 'hover:bg-[oklch(0.92_0.05_280)] hover:text-[oklch(0.4_0.1_280)]',
        link: 'text-[oklch(0.55_0.2_280)] underline-offset-4 hover:underline',
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

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
