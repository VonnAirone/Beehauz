import { AuthProvider, useAuth } from '@/utils/AuthProvider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from 'react-query'; // Import QueryClient and QueryClientProvider

const queryClient = new QueryClient(); // Create a new QueryClient instance

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {

  const [fontsLoaded, fontError] = useFonts({
    'Rubik': require('@/assets/fonts/Rubik-Regular.ttf'),
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, authInitialized } = useAuth();

  if (!authInitialized && !session?.user) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <Stack screenOptions={{headerShown: false}}/>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
