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
/**
 * "VERNA CAFE BISTRO" -> "Verna Cafe Bistro"
 *
 * Restoran adları veritabanına kullanıcının yazdığı gibi giriyor ve bazıları
 * tamamı büyük harf. Bu hâliyle sayfa title'ında ve SERP'te bağırıyor gibi
 * görünüyor. Tamamı büyük harf olan adları başlık düzenine çevirir; karışık
 * yazılmış adlara ("L'amour", "AZP") dokunmaz.
 */
export function toTitleCase(name: string): string {
  if (!name) return name
  // Zaten küçük harf içeriyorsa kullanıcı bilinçli yazmış — dokunma.
  if (name !== name.toLocaleUpperCase('tr-TR')) return name

  return name
    .toLocaleLowerCase('tr-TR')
    .split(/(\s+|-)/)
    .map((part) =>
      /^\s+$|^-$/.test(part)
        ? part
        : part.charAt(0).toLocaleUpperCase('tr-TR') + part.slice(1),
    )
    .join('')
}
