'use client'

import { useState, useEffect } from 'react'
import { SearchModal } from './search-modal'

interface PublicMenuClientProps {
  allProducts: any[]
  primaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  borderColor: string
}

export function PublicMenuClient({
  allProducts,
  primaryColor,
  backgroundColor,
  surfaceColor,
  textColor,
  borderColor
}: PublicMenuClientProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    // Find and attach click handler to search button
    const searchButton = document.getElementById('search-button')
    if (searchButton) {
      const handleClick = () => setIsSearchOpen(true)
      searchButton.addEventListener('click', handleClick)
      return () => searchButton.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <SearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      products={allProducts}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      surfaceColor={surfaceColor}
      textColor={textColor}
      borderColor={borderColor}
    />
  )
}