import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // getUser() oturumu yenilediğinde yeni token'lar supabaseResponse üzerine
  // yazılır. Redirect dönerken bunları taşımazsak yeni token'lar kaybolur;
  // eski refresh token da tüketilmiş olduğu için kullanıcı oturumdan düşer.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  const { pathname } = request.nextUrl

  // Protected routes - require authentication
  if (pathname.startsWith('/panel') && !user) {
    return redirectTo('/auth/login')
  }

  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return redirectTo('/auth/login')
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      return redirectTo('/panel')
    }
  }

  // Auth routes - redirect if already logged in
  if (pathname.startsWith('/auth') && user) {
    const { data: isAdmin } = await supabase.rpc('is_admin')
    return redirectTo(isAdmin ? '/admin' : '/panel')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}