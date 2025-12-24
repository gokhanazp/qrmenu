'use client'

import { BottomNavigation } from './bottom-navigation'

interface PublicMenuBottomNavProps {
  restaurant: any
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
}

export function PublicMenuBottomNav({
  restaurant,
  primaryColor,
  backgroundColor,
  surfaceColor,
  textColor,
}: PublicMenuBottomNavProps) {
  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMenuClick = () => {
    const categoriesSection = document.querySelector('[data-section="categories"]')
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <BottomNavigation
      restaurant={restaurant}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      surfaceColor={surfaceColor}
      textColor={textColor}
      onHomeClick={handleHomeClick}
      onMenuClick={handleMenuClick}
    />
  )
}