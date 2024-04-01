import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://trhmbrtuatfbtkiwcazo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaG1icnR1YXRmYnRraXdjYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NjQ1NTUsImV4cCI6MjAyNTQ0MDU1NX0.F_v2XbCS8kO8xoBZ5fcJw0cCrOcUCVlzlNr4I2cYACw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

