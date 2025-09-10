'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function toTitle(segment: string): string {
  if (!segment) return ''
  return segment
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export default function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const items = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const isLast = idx === segments.length - 1
    return { label: toTitle(seg), href, isLast }
  })

  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="hover:text-foreground">Home</Link>
        </li>
        {items.map((item, i) => (
          <React.Fragment key={item.href}>
            <li aria-hidden className="px-1">/</li>
            <li>
              {item.isLast ? (
                <span aria-current="page" className="text-foreground font-medium">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}


