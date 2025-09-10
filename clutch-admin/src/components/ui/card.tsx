import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border shadow-lg hover:shadow-xl transition-shadow duration-200",
        outline: "border-border bg-transparent",
        ghost: "border-transparent bg-transparent shadow-none",
        clutch: "border-clutch-red/20 bg-gradient-to-br from-clutch-red/5 to-clutch-red/10 shadow-lg",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        error: "border-destructive/20 bg-destructive/5",
        info: "border-info/20 bg-info/5",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
        compact: "p-3",
      },
      interactive: {
        true: "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  variants: {
    size: {
      default: "pb-4",
      sm: "pb-3",
      lg: "pb-6",
      xl: "pb-8",
      compact: "pb-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const cardTitleVariants = cva("text-lg font-semibold leading-none tracking-tight", {
  variants: {
    size: {
      default: "text-lg",
      sm: "text-base",
      lg: "text-xl",
      xl: "text-2xl",
      compact: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const cardDescriptionVariants = cva("text-sm text-slate-600", /* Improved contrast: 7.1:1 ratio */ {
  variants: {
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
      xl: "text-lg",
      compact: "text-xs",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const cardContentVariants = cva("", {
  variants: {
    size: {
      default: "pt-0",
      sm: "pt-0",
      lg: "pt-0",
      xl: "pt-0",
      compact: "pt-0",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const cardFooterVariants = cva("flex items-center", {
  variants: {
    size: {
      default: "pt-4",
      sm: "pt-3",
      lg: "pt-6",
      xl: "pt-8",
      compact: "pt-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div"
    const cardProps = asChild ? {} : { ref, ...props }
    
    return (
      <Comp
        className={cn(cardVariants({ variant, size, interactive }), className)}
        {...cardProps}
      />
    )
  }
)
Card.displayName = "Card"

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ size }), className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionVariants> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(cardDescriptionVariants({ size }), className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ size }), className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ size }), className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
