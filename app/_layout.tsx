import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}/>
  );
}
