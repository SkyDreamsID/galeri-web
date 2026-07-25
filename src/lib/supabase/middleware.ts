import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // Jika refresh token kadaluarsa atau tidak ditemukan, hapus cookie auth stale agar tidak spam error di terminal
      if (error.code === 'refresh_token_not_found' || error.status === 400 || error.message?.includes('Refresh Token')) {
        request.cookies.getAll().forEach((c) => {
          if (c.name.includes('auth-token') || c.name.startsWith('sb-')) {
            supabaseResponse.cookies.delete(c.name)
          }
        })
      }
    } else {
      user = data.user
    }
  } catch {
    user = null
  }

  // Protect all /admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!user) {
      // Redirect to login page if no user
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect away from login if already authenticated
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
