'use client'

import { ReactNode } from 'react'
import { BackButton } from './back-button'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  showBack?: boolean
  backHref?: string
}

export function PageHeader({ title, description, action, showBack, backHref }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {showBack && (
        <div className="mb-4">
          <BackButton href={backHref} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}