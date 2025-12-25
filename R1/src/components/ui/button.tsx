import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-elegant rounded-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md",
        outline:
          "border border-primary/30 bg-transparent text-foreground hover:bg-primary/5 hover:border-primary rounded-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md",
        ghost: 
          "hover:bg-accent/10 hover:text-accent-foreground rounded-md",
        link: 
          "text-primary underline-offset-4 hover:underline",
        // Luxury variants for resort website
        luxury:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-glow relative overflow-hidden tracking-wider uppercase text-xs font-semibold rounded-md",
        hero:
          "bg-primary/90 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20 hover:bg-primary shadow-elegant hover:shadow-glow tracking-widest uppercase text-xs font-semibold px-8 py-4 rounded-md",
        "hero-outline":
          "bg-transparent backdrop-blur-sm text-primary-foreground border-2 border-primary-foreground/60 hover:bg-primary-foreground/10 hover:border-primary-foreground tracking-widest uppercase text-xs font-semibold px-8 py-4 rounded-md",
        gold:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-elegant tracking-wider uppercase text-xs font-semibold rounded-md",
        wellness:
          "bg-wellness text-wellness-foreground hover:bg-wellness/90 shadow-soft hover:shadow-elegant rounded-md",
        warm:
          "bg-warm text-warm-foreground hover:bg-warm/80 border border-border rounded-md",
        sage:
          "bg-sage text-sage-foreground hover:bg-sage/80 rounded-md",
        minimal:
          "bg-transparent text-foreground hover:text-primary border-b border-transparent hover:border-primary rounded-none px-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10 rounded-full",
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
