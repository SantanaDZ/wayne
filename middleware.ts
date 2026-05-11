import { NextResponse, type NextRequest } from 'next/server'

// Check for Supabase auth cookie without making any network call.
// The cookie name follows the pattern: sb-<project-ref>-auth-token (may be chunked as .0, .1, …)
// Token validation and session refresh happen in Server Components via getUser().
function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    ({ name }) => name.startsWith('sb-') && name.includes('-auth-token'),
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/protected')

  if (isProtected && !hasAuthCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
