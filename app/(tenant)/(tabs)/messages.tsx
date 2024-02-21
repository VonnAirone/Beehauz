import EditScreenInfo from '@/components/edit-screen-info';
import { supabase } from '@/utils/supabase';
import { Pressable, Text, View } from 'react-native';

export default function Messages() {
  return (
    <View className={styles.container}>
      <Text className={styles.title}>Tab Two</Text>
      <View className={styles.separator} />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <Pressable onPress={() => supabase.auth.signOut()}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  container: `items-center flex-1 justify-center`,
  separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
  title: `text-xl font-bold`,
};
