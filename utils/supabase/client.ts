import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (client) return client

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                // Resilient Web Locks handler to prevent Turbopack hot-reload & multi-tab AbortError
                lock: typeof window !== 'undefined' && 'navigator' in window && 'locks' in navigator
                    ? async (name, acquireTimeout, fn) => {
                        try {
                            return await navigator.locks.request(name, { mode: 'exclusive' }, fn)
                        } catch (err: any) {
                            if (err?.name === 'AbortError' || err?.message?.includes('steal')) {
                                return undefined as any
                            }
                            throw err
                        }
                    }
                    : undefined,
            }
        }
    )

    return client
}
