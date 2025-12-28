import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

export async function updateSession(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:7',message:'updateSession entry',data:{pathname:request.nextUrl.pathname,hasSupabaseUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasAnonKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,hasPublishableKey:!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,E'})}).catch(()=>{});
  // #endregion
  const pathname = request.nextUrl.pathname

  // Early return for public routes - no auth check needed
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:12',message:'Public route, skipping auth',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to
    // debug issues with users being randomly logged out.

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:46',message:'Auth getUser result',data:{hasUser:!!user,hasAuthError:!!authError,authErrorMessage:authError?.message||null},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion

    // Redirect to login if no user and not on a public route
    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:52',message:'No user, redirecting to login',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely.

    return supabaseResponse
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:69',message:'Middleware error',data:{errorMessage:error instanceof Error?error.message:String(error),errorType:error instanceof Error?error.constructor.name:'unknown',pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion
    throw error
  }
}


