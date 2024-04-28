import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function ReservationConfirmation() {
  return (
    <SafeAreaView className='flex-1 items-center justify-center'>
      <Text className='font-medium text-lg'>Your reservation request has been made.</Text>
      <Text>Please wait for the owner to confirm your request.</Text>

      <Pressable 
      onPress={() => router.replace('/(tenant)/(tabs)/home')}
      android_ripple={{color: "white"}}
      style={{backgroundColor: "#444"}}
      className='flex-row items-center justify-center p-3 rounded-md mt-5'>
        <Ionicons name='home-outline' size={15} color={"white"}/>
        <Text className='text-white ml-2'>Back to Home</Text>
      </Pressable>
    </SafeAreaView>
  )
}