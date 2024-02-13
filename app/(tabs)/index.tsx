import { View } from 'react-native';

import { Link } from 'expo-router';

export default function TabOneScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Link href={"/(onboarding)/Usertype"} >Not registered yet? Click here</Link>
    </View>
  );
}