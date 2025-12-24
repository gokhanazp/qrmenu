export const themes = {
  dark: {
    name: 'Dark Modern',
    description: 'Koyu arka plan, modern tasarım',
    preview: '🌙',
    colors: {
      background: '#0f0a08',
      surface: '#1f1410',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#2d2318',
    },
  },
  light: {
    name: 'Light Clean',
    description: 'Aydınlık, temiz görünüm',
    preview: '☀️',
    colors: {
      background: '#f8f9fa',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
  },
  colorful: {
    name: 'Colorful Vibrant',
    description: 'Renkli, canlı tasarım',
    preview: '🎨',
    colors: {
      background: '#fff4e6',
      surface: '#fffbf0',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fed7aa',
    },
  },
  horizontal: {
    name: 'Horizontal Gallery',
    description: 'Yatay resimli, galeri görünümü',
    preview: '🖼️',
    colors: {
      background: '#e9ecef',
      surface: '#f8f9fa',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
    },
  },
} as const

export type ThemeType = keyof typeof themes

// Backward compatibility - export as THEMES too
export const THEMES = themes