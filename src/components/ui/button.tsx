import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary/85 text-primary-foreground border-primary/30 shadow-[0_14px_30px_hsl(var(--primary)/0.35)] hover:bg-primary",
        destructive:
          "bg-destructive/90 text-destructive-foreground border-destructive/40 hover:bg-destructive",
        outline:
          "border-border/70 bg-card/50 backdrop-blur-xl hover:bg-accent/50 hover:text-accent-foreground",
        secondary:
          "bg-secondary/70 text-secondary-foreground border-border/40 backdrop-blur-md hover:bg-secondary",
        ghost:
          "bg-transparent border-border/0 hover:border-border/60 hover:bg-accent/45 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-primary text-primary-foreground border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_16px_34px_hsl(var(--primary)/0.42)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.65),0_20px_40px_hsl(var(--primary)/0.5)] hover:bg-primary/95 scale-100 hover:scale-[1.02] active:scale-[0.98]",
        "neon-outline":
          "border border-primary/45 bg-card/40 backdrop-blur-xl text-primary shadow-[inset_0_1px_0_hsl(var(--glass-highlight)),0_12px_26px_hsl(var(--primary)/0.16)] hover:shadow-[inset_0_1px_0_hsl(var(--glass-highlight)),0_18px_30px_hsl(var(--primary)/0.28)] hover:border-primary hover:bg-primary/10 scale-100 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
