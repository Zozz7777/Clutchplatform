'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const snowTableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      variant: {
        default: 'border-red-200 dark:border-red-800',
        elevated: 'border-red-300 dark:border-red-700 shadow-lg',
        outline: 'border-red-200 dark:border-red-700',
        ghost: 'border-transparent',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface SnowTableProps
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof snowTableVariants> {}

const SnowTable = React.forwardRef<HTMLTableElement, SnowTableProps>(
  ({ className, variant, size, ...props }, ref) => (
    <table
      ref={ref}
      className={cn(snowTableVariants({ variant, size, className }))}
      {...props}
    />
  )
)
SnowTable.displayName = 'SnowTable'

const SnowTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800', className)}
    {...props}
  />
))
SnowTableHeader.displayName = 'SnowTableHeader'

const SnowTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-red-100 dark:divide-red-900/30', className)}
    {...props}
  />
))
SnowTableBody.displayName = 'SnowTableBody'

const SnowTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-800', className)}
    {...props}
  />
))
SnowTableFooter.displayName = 'SnowTableFooter'

const SnowTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-red-100 dark:border-red-900/30 transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/10',
      className
    )}
    {...props}
  />
))
SnowTableRow.displayName = 'SnowTableRow'

const SnowTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-red-900 dark:text-red-100 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
SnowTableHead.displayName = 'SnowTableHead'

const SnowTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
SnowTableCell.displayName = 'SnowTableCell'

const SnowTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-slate-600 text-slate-600', className)}
    {...props}
  />
))
SnowTableCaption.displayName = 'SnowTableCaption'

export {
  SnowTable,
  SnowTableHeader,
  SnowTableBody,
  SnowTableFooter,
  SnowTableHead,
  SnowTableRow,
  SnowTableCell,
  SnowTableCaption,
  snowTableVariants,
}

