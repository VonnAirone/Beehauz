import React from 'react';
import { useContext, useEffect, useState, createContext } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { supabase } from './supabase';
import { AppState } from 'react-native';

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
    const isUserSignedIn = session?.user;
    
    if (!session) {
      router.replace('/(auth)/');
    }

    if (!isUserSignedIn && !inAuthGroup) {
      router.replace('/(auth)/');
    } else if (isUserSignedIn && inAuthGroup) {
      if (session?.user.user_metadata.profileCompleted === false) {
        router.replace('/Usertype');
      } else {
        const userType = session?.user.user_metadata?.usertype || '';
  
        if (userType === 'Tenant') {
          router.replace('/(tenant)/(tabs)/home');
        } else {
          router.replace('/(owner)/(tabs)/Dashboard');
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
          async (event, session) => {
            if (event === 'TOKEN_REFRESHED') {
              supabase.auth.startAutoRefresh()
              setSession(session);
            } else {
              supabase.auth.startAutoRefresh()
              setSession(session);
              setAuthInitialized(true);
            }
          }
        );
  
        // Add AppState change listener for auto-refresh
        AppState.addEventListener('change', (state) => {
          if (state === 'active') {
            supabase.auth.startAutoRefresh();
          } else {
            supabase.auth.stopAutoRefresh();
          }
        });
  
        return () => {
          authListenerData.subscription?.unsubscribe();
        };
      } catch (error) {
        console.log('Error initializing session: ', error);
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