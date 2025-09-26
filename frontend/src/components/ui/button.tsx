import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 transform hover:scale-105 transition-all duration-300",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground transform hover:scale-105 transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 transform hover:scale-105 transition-all duration-300",
        ghost:
          "hover:bg-accent hover:text-accent-foreground transform hover:scale-105 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white hover:from-brand-blue-dark hover:to-brand-blue shadow-lg hover:shadow-xl transition-all duration-500 font-semibold btn-shine transform hover:scale-105 hover:-translate-y-1 border-0",
        "hero-outline":
          "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue hover:text-white transition-all duration-500 font-semibold hover:shadow-xl hover:border-brand-blue-dark transform hover:scale-105 hover:-translate-y-1",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
