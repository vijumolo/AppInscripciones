import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL='))?.split('=')[1] || '';
const key = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1]?.trim() || '';

const supabase = createClient(url, key);

async function test() {
    console.log("Fetching event_config...");
    const { data: eventData } = await supabase.from('event_config').select('*').order('created_at', { ascending: false });
    console.log("EVENT CONFIGS:", eventData);

    console.log("\nFetching participants...");
    const { data: participants } = await supabase.from('participants').select('id, fullname, event_id');
    console.log("PARTICIPANTS:", participants);
}
test();
