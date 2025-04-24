import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvxusxpzmcxtlmrfkwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2eHVzeHB6bWN4dGxtcmZrd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyOTIyNTUsImV4cCI6MjA2MDg2ODI1NX0.1I4E2DxCNEC79WHD0Ds7Dg0rqSf-n_WeUouMxsvHASc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

