import './install-storage';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local.');
}

export const supabase = createClient(url, key, {
  auth: {
    storage: {
      getItem: (name) => globalThis.localStorage?.getItem(name) ?? null,
      setItem: (name, value) => globalThis.localStorage?.setItem(name, value),
      removeItem: (name) => globalThis.localStorage?.removeItem(name),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
