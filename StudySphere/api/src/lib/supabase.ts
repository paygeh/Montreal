import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://kyqkilqbrvvgspwurodq.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_F8a2Nx00HPb6nQ9mXwtJgg_q_fJsmE2'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_hRMVilry6impHzB_h2LcEw_BhCDwcmu'

// Client for user operations (uses RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for bypassing RLS (service operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default supabase
