'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/i18n/use-locale'

interface BackButtonProps {
  href?: string
  label?: string
}

export function BackButton({ href, label }: BackButtonProps) {
  const router = useRouter()
  const { t } = useLocale()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="gap-2"
    >
      <span>←</span>
      <span>{label || t.common.back}</span>
    </Button>
  )
}