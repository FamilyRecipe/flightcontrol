import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only match routes that need authentication:
     * - Dashboard routes (/)
     * - Project routes (/projects/:path*)
     * - Settings routes (/settings)
     * - Auth routes (login, register, callback)
     * 
     * Exclude:
     * - API routes (they handle their own auth)
     * - Static files (_next/static, _next/image)
     * - Image files
     * - Favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}


