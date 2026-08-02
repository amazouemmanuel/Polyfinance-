import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://annrqgmaodawarqsrlod.supabase.co'
const supabaseAnonKey = 'sb_publishable_Gp6nxCzs7k53kqn2-IS_sg_iqoM3A_S'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
