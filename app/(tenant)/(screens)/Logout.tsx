import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/utils/AuthProvider';

export default function Logout() {
  const user = useAuth().session?.user;

  async function SignOutUser() {
    const { error } = await supabase.auth.signOut() 

    if (error) {
      console.log("Error signing out user", error.message)
    }
  }
  return (
    <TouchableOpacity 
    onPress={SignOutUser}
    className='bg-yellow py-3 px-6 rounded-md'>
      <Text className='text-white'>Logout</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({})