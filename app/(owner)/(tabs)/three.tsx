import { Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import Logout from '@/app/(tenant)/(screens)/Logout';
import { useAuth } from '@/utils/AuthProvider';
import { supabase } from '@/utils/supabase';

export default function Three() {
  const { session } = useAuth();
  const user = session?.user;

  async function signOutUser() {
    if (!user) {
      console.log("No user found, cannot sign out");
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error signing out user:", error.message);
    } else {
      console.log("User signed out successfully");
    }
  }


  return (
    <View className='flex-1 justify-center items-center'>
      <TouchableOpacity 
        onPress={signOutUser}
        className='bg-yellow py-3 px-6 rounded-md'>
        <Text className='text-white'>Test</Text>
      </TouchableOpacity>
    </View>
  );
}
