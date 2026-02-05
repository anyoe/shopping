import { createServerClient } from 'supabase-auth-helpers-qwik';
import type { RequestEventBase } from '@builder.io/qwik-city';

const viteUrl = import.meta.env.VITE_SUPABASE_URL;
const viteAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const createClient = (event: RequestEventBase) => {
    const url = viteUrl || event.env.get('VITE_SUPABASE_URL');
    const anonKey = viteAnonKey || event.env.get('VITE_SUPABASE_ANON_KEY');
    return createServerClient(
        url,
        anonKey,
        event
    );
};