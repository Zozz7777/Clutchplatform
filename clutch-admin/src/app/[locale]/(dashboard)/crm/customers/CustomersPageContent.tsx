'use client'

import React from 'react'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function CustomersPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer relationships and data
        </p>
      </div>

      <div className="flex justify-end">
        <SnowButton variant="default" icon={<UserPlus className="h-4 w-4" />}>
          Add Customer
        </SnowButton>
      </div>
    </div>
  )
}

