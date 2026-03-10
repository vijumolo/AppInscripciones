import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL='))?.split('=')[1] || '';
const key = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1] || '';

const supabase = createClient(url, key);

async function test() {
    const { data: participants } = await supabase.from('participants').select('category');
    console.log("Categorias de participantes:", [...new Set(participants?.map(p => p.category))]);
}
test();
