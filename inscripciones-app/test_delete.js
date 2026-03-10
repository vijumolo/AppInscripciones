import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL='))?.split('=')[1] || '';
const key = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1]?.trim() || '';

const supabase = createClient(url, key);

async function test() {
    console.log("Attempting to delete all participants...");
    const { data, error } = await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000').select();
    console.log("Deleted data:", data);
    console.log("Error:", error);
}
test();
