"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { SnowButton } from "@/components/ui/snow-button"
import { SnowInput } from "@/components/ui/snow-input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    value ? value.toISOString().split('T')[0] : ''
  )

  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString)
    if (dateString && onChange) {
      onChange(new Date(dateString))
    } else if (onChange) {
      onChange(undefined)
    }
  }

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value.toISOString().split('T')[0])
    } else {
      setSelectedDate('')
    }
  }, [value])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <SnowButton
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {selectedDate ? (
              new Date(selectedDate).toLocaleDateString()
            ) : (
              <span>{placeholder}</span>
            )}
          </SnowButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <SnowInput
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}


