import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  console.log("Calling RPC...");
  const { data, error } = await supabase.rpc('get_top_leaderboard', { filter_material_id: 'overall' });
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
