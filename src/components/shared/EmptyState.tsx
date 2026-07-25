import React from 'react'
import { InboxIcon } from 'hugeicons-react'

export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
    <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <InboxIcon size={28} className="text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-5 max-w-xs">{description}</p>}
    {action}
  </div>
)
