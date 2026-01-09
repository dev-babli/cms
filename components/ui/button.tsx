import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    // 2026: WCAG 2.2 AA compliant, 8-point grid, minimum 44px touch target
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 cubic-bezier(0.4, 0, 0.2, 1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] min-w-[44px]",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95",
                outline:
                    "border border-border bg-background hover:bg-interactive-hover active:bg-interactive-active",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
                ghost: "hover:bg-interactive-hover active:bg-interactive-active hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline h-auto min-h-0 min-w-0 p-0",
            },
            size: {
                // 2026: All sizes meet minimum 44px touch target
                default: "h-11 px-4 py-2.5 text-sm", // 44px height (8-point grid)
                sm: "h-10 rounded-md px-3 text-xs min-h-[44px]", // Still 44px minimum
                lg: "h-12 rounded-md px-6 text-base", // 48px (6 * 8)
                icon: "h-11 w-11 p-0", // 44px minimum
                link: "h-auto p-0 min-h-0 min-w-0", // Links exempt from touch target
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            iconLeft,
            iconRight,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {iconLeft && <span className="mr-2">{iconLeft}</span>}
                {children}
                {iconRight && <span className="ml-2">{iconRight}</span>}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };

