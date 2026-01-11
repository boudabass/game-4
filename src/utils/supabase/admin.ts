import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        if (!url) console.error("[Admin Client] CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL is missing! (Build-time issue)");
        if (!key) console.error("[Admin Client] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing! (Runtime/Docker Compose issue)");
        throw new Error("Supabase Admin configuration missing");
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
