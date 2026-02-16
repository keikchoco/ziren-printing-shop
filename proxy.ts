import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  try {
    // Check session first for all routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // If user is logged in
    if (session) {
      // Redirect home page to admin dashboard
      if (pathname === "/" || pathname === "") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      // Allow access to all other routes if logged in
      return NextResponse.next()
    }

    // If user is NOT logged in
    if (!session) {
      // Protect /admin routes - redirect to home
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", request.url))
      }
      // Allow access to public routes
      return NextResponse.next()
    }
  } catch (error) {
    // If there's an error checking the session, protect /admin routes
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
