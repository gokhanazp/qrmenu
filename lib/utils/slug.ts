export function generateSlug(name: string): string {
  // Türkçe karakter dönüşümü
  const turkishMap: Record<string, string> = {
    ş: 's', Ş: 's',
    ğ: 'g', Ğ: 'g',
    ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o',
    ü: 'u', Ü: 'u',
    ç: 'c', Ç: 'c',
  }
  
  let slug = name.toLowerCase()
  
  // Türkçe karakterleri değiştir
  Object.entries(turkishMap).forEach(([turkish, english]) => {
    slug = slug.replace(new RegExp(turkish, 'g'), english)
  })
  
  // Özel karakterleri temizle
  slug = slug.replace(/[^a-z0-9\s-]/g, '')
  
  // Boşlukları tire ile değiştir
  slug = slug.replace(/\s+/g, '-')
  
  // Birden fazla tireyi tek tire yap
  slug = slug.replace(/-+/g, '-')
  
  // Baş ve sondaki tireleri temizle
  slug = slug.replace(/^-+|-+$/g, '')
  
  return slug || 'restoran'
}