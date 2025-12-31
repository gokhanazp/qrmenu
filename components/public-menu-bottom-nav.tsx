'use client'

import { BottomNavigation } from './bottom-navigation'

interface PublicMenuBottomNavProps {
  restaurant: any
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  iconColor?: string
  currentLang?: string
}

export function PublicMenuBottomNav({
  restaurant,
  primaryColor,
  backgroundColor,
  surfaceColor,
  textColor,
  iconColor,
  currentLang = 'tr',
}: PublicMenuBottomNavProps) {
  return (
    <BottomNavigation
      restaurant={restaurant}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      surfaceColor={surfaceColor}
      textColor={textColor}
      iconColor={iconColor}
      currentLang={currentLang}
    />
  )
}