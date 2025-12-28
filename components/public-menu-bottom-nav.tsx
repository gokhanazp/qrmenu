'use client'

import { BottomNavigation } from './bottom-navigation'

interface PublicMenuBottomNavProps {
  restaurant: any
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  iconColor?: string
}

export function PublicMenuBottomNav({
  restaurant,
  primaryColor,
  backgroundColor,
  surfaceColor,
  textColor,
  iconColor,
}: PublicMenuBottomNavProps) {
  return (
    <BottomNavigation
      restaurant={restaurant}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      surfaceColor={surfaceColor}
      textColor={textColor}
      iconColor={iconColor}
    />
  )
}