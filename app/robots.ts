import { MetadataRoute } from 'next'

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/restorant/', '/auth/register', '/auth/login'],
        disallow: [
          '/panel/',
          '/admin/',
          '/api/',
          '/auth/callback',
          '/auth/reset-password',
          '/auth/update-password',
          '/_next/',
          '/error',
          '*?*lang=', // duplicate dil parametresi crawl edilmesin
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/restorant/'],
        disallow: ['/panel/', '/admin/', '/api/', '/auth/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/restorant/'],
        disallow: ['/panel/', '/admin/', '/api/', '/auth/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/restorant/'],
        disallow: ['/panel/', '/admin/', '/api/', '/auth/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/restorant/'],
        disallow: ['/panel/', '/admin/', '/api/', '/auth/'],
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
