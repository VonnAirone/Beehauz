import React from 'react';
import { useContext, useEffect, useState, createContext } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { supabase } from './supabase';

interface Props {
  children?: React.ReactNode;
}

export interface AuthContextType {
  session: AuthSession | null | undefined;
  authInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: Props) {
  const segments = useSegments();
  const router = useRouter();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || !authInitialized) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (
      !session?.user &&
      !inAuthGroup
    ) {
      router.replace('/(auth)/');
    } else if (session?.user && inAuthGroup) {
      if (session?.user.user_metadata.profileCompleted == false) {
        router.replace('/Usertype')
      } else {
        if (session?.user.user_metadata.usertype == "Tenant") {
          router.replace("/(tenant)/(screens)/TenantProperty")
        } else {
          router.replace("/(owner)/(tabs)/Dashboard")
        }
      }
    }
  }, [session, segments, authInitialized, navigationState?.key]);

  useEffect(() => {
    async function initializeSession() {
      try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authData?.session) {
        setSession(authData.session);
        setAuthInitialized(true);
      } else {
        setAuthInitialized(true);
      }

      const { data: authListenerData } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setAuthInitialized(true);

          if (_event == 'TOKEN_REFRESHED') {
            // Handle accordingly
          }
        }
      );
      return () => {
        authListenerData.subscription?.unsubscribe();
      };
    } catch (error) {
      console.log('Error initializing session: ', error)
    }
  }

    initializeSession().then(() => {
      // Check if the session is initialized and the user is authenticated.
      if (session?.user) {
        setAuthInitialized(true);
        router.replace('/');
      } else {
        setAuthInitialized(true);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, authInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within a MyUserContextProvider.`);
  }
  return context;
};