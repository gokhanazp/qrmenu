import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/restorant/'],
        disallow: ['/panel/', '/admin/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}