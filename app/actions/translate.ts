'use server'

// Simple translation function using free translation API
// You can replace this with OpenAI, Google Translate, or any other translation service

export async function translateToEnglish(text: string): Promise<{ success: boolean; translation?: string; error?: string }> {
  if (!text || text.trim() === '') {
    return { success: false, error: 'Çevrilecek metin boş' }
  }

  try {
    // Using LibreTranslate API (free and open source)
    // You can also use Google Translate API, DeepL, or OpenAI
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'tr',
        target: 'en',
        format: 'text'
      }),
    })

    if (!response.ok) {
      // Fallback: Try MyMemory Translation API (free, no API key needed)
      return await translateWithMyMemory(text)
    }

    const data = await response.json()
    
    if (data.translatedText) {
      return { success: true, translation: data.translatedText }
    }

    // Fallback to MyMemory if LibreTranslate fails
    return await translateWithMyMemory(text)
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback to MyMemory Translation API
    return await translateWithMyMemory(text)
  }
}

// Fallback translation using MyMemory API (free, no API key required)
async function translateWithMyMemory(text: string): Promise<{ success: boolean; translation?: string; error?: string }> {
  try {
    const encodedText = encodeURIComponent(text)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=tr|en`
    )

    if (!response.ok) {
      return { success: false, error: 'Çeviri servisi şu anda kullanılamıyor' }
    }

    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return { success: true, translation: data.responseData.translatedText }
    }

    return { success: false, error: 'Çeviri yapılamadı' }
  } catch (error) {
    console.error('MyMemory translation error:', error)
    return { success: false, error: 'Çeviri servisi hatası' }
  }
}

// Batch translation for multiple texts
export async function translateMultipleToEnglish(texts: { key: string; value: string }[]): Promise<{ 
  success: boolean; 
  translations?: { key: string; translation: string }[]; 
  error?: string 
}> {
  try {
    const results: { key: string; translation: string }[] = []
    
    for (const item of texts) {
      if (item.value && item.value.trim() !== '') {
        const result = await translateToEnglish(item.value)
        if (result.success && result.translation) {
          results.push({ key: item.key, translation: result.translation })
        } else {
          results.push({ key: item.key, translation: '' })
        }
      } else {
        results.push({ key: item.key, translation: '' })
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return { success: true, translations: results }
  } catch (error) {
    console.error('Batch translation error:', error)
    return { success: false, error: 'Toplu çeviri hatası' }
  }
}