import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const srk = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cXZuend0cXJxeGlnb3RjdmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTE3ODY2MSwiZXhwIjoyMDEwNzU0NjYxfQ.D0uUadAlz2RFTJRB14-bkrswjo5FK_iCfnB3l03vPFM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});


export const admin = createClient(supabaseUrl, srk, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
