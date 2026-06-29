import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './lib/supabase/types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session so server components always see a valid session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── /host/* — authentication only ────────────────────────────
  //
  // The host portal data layer already filters everything by host_id = auth.uid(),
  // so a guest who somehow reaches /host/dashboard sees "No chalets yet" and cannot
  // touch any data. Keeping role-gating here causes a profile DB query on every
  // /host/* request — including /host/login — which made router.refresh() hang
  // indefinitely after sign-in. Authentication check is sufficient in middleware.
  if (pathname.startsWith('/host') && !pathname.startsWith('/host/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/host/login', request.url))
    }
  }

  // ── /admin/* — authentication + admin role ───────────────────
  //
  // Admin routes need the role check because admins can read and write all data.
  // Profile query only runs for /admin/* paths, never for /host/* paths.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as unknown as { data: { role: string } | null }
    if (!profileData || profileData.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // ── Redirect authenticated users away from login pages ───────
  if (user) {
    // For /host/login: redirect any authenticated user to the dashboard.
    // No role query needed — if they shouldn't be there the page shows an empty state.
    if (pathname === '/host/login') {
      return NextResponse.redirect(new URL('/host/dashboard', request.url))
    }
    // For /admin/login: only redirect confirmed admins (prevents non-admins from
    // getting bounced to a forbidden page).
    if (pathname === '/admin/login') {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as unknown as { data: { role: string } | null }
      if (profileData?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and public assets.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webpt)$).*)',
  ],
}
