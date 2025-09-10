import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { SnowButton } from '@/components/ui/snow-button'

const tableVariants = cva(
  "w-full caption-bottom text-sm",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border border-border",
        striped: "",
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tableHeaderVariants = cva(
  "border-b bg-muted/50 font-medium [&_tr]:border-b-0",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-b border-border",
        striped: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tableBodyVariants = cva(
  "[&_tr:last-child]:border-0",
  {
    variants: {
      variant: {
        default: "",
        bordered: "",
        striped: "[&_tr:nth-child(even)]:bg-muted/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tableRowVariants = cva(
  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-b border-border",
        striped: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tableCellVariants = cva(
  "p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-r border-border last:border-r-0",
        striped: "",
      },
      size: {
        default: "p-4",
        sm: "p-2",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tableHeadCellVariants = cva(
  "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-r border-border last:border-r-0",
        striped: "",
      },
      size: {
        default: "px-4",
        sm: "px-2",
        lg: "px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, loading, emptyMessage = "No data available", emptyIcon, children, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(tableVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </table>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
)
Table.displayName = "Table"

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement>,
    VariantProps<typeof tableHeaderVariants> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, variant, ...props }, ref) => (
    <thead ref={ref} className={cn(tableHeaderVariants({ variant }), className)} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement>,
    VariantProps<typeof tableBodyVariants> {
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  children?: React.ReactNode
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, variant, emptyMessage = "No data available", emptyIcon, children, ...props }, ref) => {
    const hasChildren = React.Children.count(children) > 0
    
    return (
      <tbody ref={ref} className={cn(tableBodyVariants({ variant }), className)} {...props}>
        {hasChildren ? (
          children
        ) : (
          <tr>
            <td colSpan={100} className="h-24 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                {emptyIcon && <div className="text-muted-foreground">{emptyIcon}</div>}
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    )
  }
)
TableBody.displayName = "TableBody"

export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
)
TableFooter.displayName = "TableFooter"

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {
  selected?: boolean
  onClick?: () => void
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant, selected, onClick, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? "selected" : undefined}
      className={cn(
        tableRowVariants({ variant }),
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableHeadCellVariants> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, variant, size, sortable, sortDirection, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(tableHeadCellVariants({ variant, size }), className)}
      {...props}
    >
      {sortable ? (
        <SnowButton
          className="flex items-center space-x-1 hover:text-foreground transition-colors"
          onClick={onSort}
        >
          <span>{children}</span>
          <span className="flex items-center">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4" />
            )}
          </span>
        </SnowButton>
      ) : (
        children
      )}
    </th>
  )
)
TableHead.displayName = "TableHead"

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableCellVariants> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, variant, size, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(tableCellVariants({ variant, size }), className)}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}


