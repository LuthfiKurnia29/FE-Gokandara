'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { type VariantProps, cva } from 'class-variance-authority';

const separatorVariants = cva('shrink-0 bg-border', {
    variants: {
        orientation: {
            horizontal: 'h-[1px] w-full',
            vertical: 'h-full w-[1px]'
        }
    },
    defaultVariants: {
        orientation: 'horizontal'
    }
});

export interface SeparatorProps
    extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
        VariantProps<typeof separatorVariants> {
    orientation?: 'horizontal' | 'vertical';
}

const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
    ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
        <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(separatorVariants({ orientation }), className)}
            {...props}
        />
    )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
