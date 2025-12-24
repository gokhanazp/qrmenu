# QR Menü SaaS - Teknik Spesifikasyonlar

Bu doküman, projenin teknik detaylarını, veri yapılarını, API endpoint'lerini ve iş kurallarını içerir.

---

## 1. TypeScript Type Definitions

### 1.1 Database Types

```typescript
// lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          slug: string
          logo_url: string | null
          hero_url: string | null
          slogan: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          slug: string
          logo_url?: string | null
          hero_url?: string | null
          slogan?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          hero_url?: string | null
          slogan?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scan_events: {
        Row: {
          id: string
          restaurant_id: string
          scanned_at: string
          user_agent: string | null
          referrer: string | null
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          scanned_at?: string
          user_agent?: string | null
          referrer?: string | null
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          scanned_at?: string
          user_agent?: string | null
          referrer?: string | null
          ip_hash?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          restaurant_id: string
          plan: 'free' | 'pro'
          status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          plan?: 'free' | 'pro'
          status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          plan?: 'free' | 'pro'
          status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          restaurant_id: string
          amount: number
          currency: string
          status: 'paid' | 'failed' | 'refunded' | 'pending'
          provider: string
          provider_payment_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          amount: number
          currency?: string
          status: 'paid' | 'failed' | 'refunded' | 'pending'
          provider?: string
          provider_payment_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          amount?: number
          currency?: string
          status?: 'paid' | 'failed' | 'refunded' | 'pending'
          provider?: string
          provider_payment_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      generate_unique_slug: {
        Args: { base_name: string }
        Returns: string
      }
      get_scan_metrics: {
        Args: { rest_id: string; days?: number }
        Returns: Array<{ date: string; scan_count: number }>
      }
      get_restaurant_scan_stats: {
        Args: { rest_id: string }
        Returns: {
          scans_today: number
          scans_7d: number
          scans_30d: number
          scans_total: number
        }
      }
    }
  }
}
```

### 1.2 Application Types

```typescript
// types/index.ts

export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ScanEvent = Database['public']['Tables']['scan_events']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

export interface RestaurantWithStats extends Restaurant {
  scans_today: number
  scans_7d: number
  scans_total: number
  subscription?: Subscription
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface MenuData {
  restaurant: Restaurant
  categories: CategoryWithProducts[]
}

export interface ScanStats {
  scans_today: number
  scans_7d: number
  scans_30d: number
  scans_total: number
}

export interface ScanMetric {
  date: string
  scan_count: number
}

export type SubscriptionPlan = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
export type PaymentStatus = 'paid' | 'failed' | 'refunded' | 'pending'
```

---

## 2. Validation Schemas (Zod)

### 2.1 Auth Schemas

```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  restaurantName: z
    .string()
    .min(3, 'Restoran adı en az 3 karakter olmalıdır')
    .max(100, 'Restoran adı en fazla 100 karakter olabilir'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

### 2.2 Restaurant Schemas

```typescript
// lib/validations/restaurant.ts
import { z } from 'zod'

export const restaurantSettingsSchema = z.object({
  name: z
    .string()
    .min(3, 'Restoran adı en az 3 karakter olmalıdır')
    .max(100, 'Restoran adı en fazla 100 karakter olabilir'),
  slogan: z
    .string()
    .max(200, 'Slogan en fazla 200 karakter olabilir')
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
})

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Dosya boyutu en fazla 5MB olabilir')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Sadece JPG, PNG ve WebP formatları desteklenir'
    ),
})

export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>
export type ImageUploadInput = z.infer<typeof imageUploadSchema>
```

### 2.3 Category Schemas

```typescript
// lib/validations/category.ts
import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı en az 2 karakter olmalıdır')
    .max(50, 'Kategori adı en fazla 50 karakter olabilir'),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const reorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    })
  ),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>
```

### 2.4 Product Schemas

```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Ürün adı en az 2 karakter olmalıdır')
    .max(100, 'Ürün adı en fazla 100 karakter olabilir'),
  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .nullable(),
  price: z
    .number()
    .positive('Fiyat pozitif bir sayı olmalıdır')
    .max(999999.99, 'Fiyat çok yüksek'),
  category_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof productSchema>
```

### 2.5 Admin Schemas

```typescript
// lib/validations/admin.ts
import { z } from 'zod'

export const subscriptionUpdateSchema = z.object({
  plan: z.enum(['free', 'pro']),
  status: z.enum(['active', 'inactive', 'past_due', 'canceled', 'trialing']),
  current_period_start: z.string().datetime().optional().nullable(),
  current_period_end: z.string().datetime().optional().nullable(),
})

export const paymentCreateSchema = z.object({
  restaurant_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('TRY'),
  status: z.enum(['paid', 'failed', 'refunded', 'pending']),
  provider: z.string().default('manual'),
  provider_payment_id: z.string().optional().nullable(),
  paid_at: z.string().datetime().optional().nullable(),
})

export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>
```

---

## 3. Server Actions

### 3.1 Auth Actions

```typescript
// app/actions/auth.ts

interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

export async function login(input: LoginInput): Promise<AuthResult>
export async function register(input: RegisterInput): Promise<AuthResult>
export async function logout(): Promise<AuthResult>
export async function resetPassword(email: string): Promise<AuthResult>
```

### 3.2 Restaurant Actions

```typescript
// app/actions/restaurant.ts

export async function getRestaurant(): Promise<Restaurant | null>
export async function updateRestaurant(input: RestaurantSettingsInput): Promise<AuthResult>
export async function uploadRestaurantImage(
  type: 'logo' | 'hero',
  file: File
): Promise<{ url: string } | { error: string }>
export async function deleteRestaurantImage(type: 'logo' | 'hero'): Promise<AuthResult>
```

### 3.3 Category Actions

```typescript
// app/actions/category.ts

export async function getCategories(): Promise<Category[]>
export async function createCategory(input: CategoryInput): Promise<AuthResult>
export async function updateCategory(id: string, input: CategoryInput): Promise<AuthResult>
export async function deleteCategory(id: string): Promise<AuthResult>
export async function reorderCategories(input: ReorderCategoriesInput): Promise<AuthResult>
```

### 3.4 Product Actions

```typescript
// app/actions/product.ts

export async function getProducts(filters?: {
  category_id?: string
  is_active?: boolean
  search?: string
}): Promise<Product[]>
export async function getProduct(id: string): Promise<Product | null>
export async function createProduct(input: ProductInput): Promise<AuthResult>
export async function updateProduct(id: string, input: ProductInput): Promise<AuthResult>
export async function deleteProduct(id: string): Promise<AuthResult>
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<{ url: string } | { error: string }>
```

### 3.5 Admin Actions

```typescript
// app/actions/admin.ts

export async function getRestaurants(filters?: {
  plan?: SubscriptionPlan
  status?: SubscriptionStatus
  is_active?: boolean
  search?: string
}): Promise<RestaurantWithStats[]>

export async function getRestaurantDetail(id: string): Promise<{
  restaurant: Restaurant
  subscription: Subscription
  stats: ScanStats
  metrics: ScanMetric[]
  payments: Payment[]
} | null>

export async function updateSubscription(
  restaurantId: string,
  input: SubscriptionUpdateInput
): Promise<AuthResult>

export async function createPayment(input: PaymentCreateInput): Promise<AuthResult>

export async function addAdminUser(userId: string): Promise<AuthResult>
export async function removeAdminUser(userId: string): Promise<AuthResult>
```

---

## 4. API Routes

### 4.1 Scan Tracking API

```typescript
// app/api/scan/route.ts

POST /api/scan
Request Body:
{
  restaurantId: string (uuid)
}

Response:
{
  success: boolean
  error?: string
}

Headers:
- User-Agent: string
- Referer: string
- X-Forwarded-For: string (IP)

Rate Limit: 1 request per 10 minutes per IP+restaurant
```

### 4.2 Analytics API (Admin)

```typescript
// app/api/admin/analytics/route.ts

GET /api/admin/analytics
Query Params:
- period: 'today' | '7d' | '30d' | 'all'

Response:
{
  total_restaurants: number
  active_restaurants: number
  total_scans: number
  scans_today: number
  scans_7d: number
  active_subscriptions: number
  total_revenue: number
}

Auth: Admin required
```

---

## 5. Utility Functions

### 5.1 Slug Generation

```typescript
// lib/utils/slug.ts

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
```

### 5.2 IP Hashing

```typescript
// lib/utils/ip-hash.ts
import crypto from 'crypto'

export function hashIP(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + process.env.IP_HASH_SALT)
    .digest('hex')
}

export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP
}
```

### 5.3 Image Optimization

```typescript
// lib/utils/image.ts

export async function optimizeImage(file: File): Promise<File> {
  // Client-side image resize ve compress
  // Browser API veya library kullanılabilir
  return file
}

export function getImagePath(
  restaurantId: string,
  type: 'logo' | 'hero' | 'product',
  filename: string
): string {
  if (type === 'product') {
    return `${restaurantId}/products/${filename}`
  }
  return `${restaurantId}/${type}.${filename.split('.').pop()}`
}
```

### 5.4 Date Formatting

```typescript
// lib/utils/date.ts

export function formatDate(date: string | Date, locale: string = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date, locale: string = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getIstanbulDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }))
}
```

### 5.5 Currency Formatting

```typescript
// lib/utils/currency.ts

export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
```

---

## 6. Environment Variables

### 6.1 Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Security
IP_HASH_SALT=random-salt-string

# Optional
NEXT_PUBLIC_VERCEL_ENV=production
```

### 6.2 Development vs Production

```typescript
// lib/config.ts

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_SITE_URL!,
    env: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  },
  security: {
    ipHashSalt: process.env.IP_HASH_SALT!,
  },
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
    enableErrorTracking: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  },
}
```

---

## 7. Error Handling

### 7.1 Error Types

```typescript
// lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} bulunamadı`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz yok') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}
```

### 7.2 Error Handler

```typescript
// lib/utils/error-handler.ts

export function handleError(error: unknown): { error: string; code?: string } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
    }
  }
  
  if (error instanceof Error) {
    return {
      error: error.message,
    }
  }
  
  return {
    error: 'Beklenmeyen bir hata oluştu',
  }
}
```

---

## 8. Middleware Configuration

### 8.1 Auth Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protected routes
  if (request.nextUrl.pathname.startsWith('/panel')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  // Admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/panel', request.url))
    }
  }
  
  // Auth routes (redirect if already logged in)
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
    const { data: isAdmin } = await supabase.rpc('is_admin')
    const redirectUrl = isAdmin ? '/admin' : '/panel'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/panel/:path*', '/admin/:path*', '/auth/:path*'],
}
```

---

## 9. Performance Optimization

### 9.1 ISR Configuration

```typescript
// app/restorant/[slug]/page.tsx

export const revalidate = 60 // 60 saniye ISR

export async function generateStaticParams() {
  const supabase = createClient()
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug')
    .eq('is_active', true)
  
  return restaurants?.map((r) => ({ slug: r.slug })) || []
}
```

### 9.2 Image Optimization

```typescript
// next.config.js

module.exports = {
  images: {
    domains: ['your-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

---

## 10. Testing Strategy

### 10.1 Unit Test Example

```typescript
// __tests__/utils/slug.test.ts
import { generateSlug } from '@/lib/utils/slug'

describe('generateSlug', () => {
  it('should convert Turkish characters', () => {
    expect(generateSlug('Şık Restoran')).toBe('sik-restoran')
  })
  
  it('should handle special characters', () => {
    expect(generateSlug('Test & Restaurant!')).toBe('test-restaurant')
  })
  
  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('restoran')
  })
})
```

### 10.2 Integration Test Example

```typescript
// __tests__/actions/restaurant.test.ts
import { updateRestaurant } from '@/app/actions/restaurant'

describe('updateRestaurant', () => {
  it('should update restaurant successfully', async () => {
    const result = await updateRestaurant({
      name: 'Updated Name',
      slogan: 'New Slogan',
      is_active: true,
    })
    
    expect(result.success).toBe(true)
  })
  
  it('should fail with invalid data', async () => {
    const result = await updateRestaurant({
      name: 'AB', // Too short
      slogan: null,
      is_active: true,
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

---

Bu teknik spesifikasyon dokümanı, implementasyon sırasında referans olarak kullanılabilir. Tüm type definitions, validation schemas ve utility functions burada tanımlanmıştır.