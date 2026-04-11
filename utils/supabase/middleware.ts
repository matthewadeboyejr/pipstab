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

    

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/overview') || request.nextUrl.pathname.startsWith('/macro')

    if (!user && isProtectedRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/auth/sign-in'
        return NextResponse.redirect(url)
    }

    // If a user is ALREADY logged in, don't let them accidentally go to the sign-up/sign-in pages
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/overview'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
