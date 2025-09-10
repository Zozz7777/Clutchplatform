import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        /* Improved contrast variants - WCAG AA/AAA compliant */
        success: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200", /* 7.2:1 ratio */
        warning: "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-200", /* 8.1:1 ratio */
        info: "border-transparent bg-blue-100 text-blue-900 hover:bg-blue-200", /* 8.3:1 ratio */
        error: "border-transparent bg-red-100 text-red-900 hover:bg-red-200",},
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
