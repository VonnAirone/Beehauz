import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function VisitConfirmation() {
  return (
    <SafeAreaView className='flex-1 items-center justify-center'>
      <Ionicons name='checkmark-circle' size={40} color={'green'}/>
      <Text className='font-medium text-lg'>Your request for a visit has been made.</Text>
      <Text>Please wait for the owner to confirm your request.</Text>

      <Text className='w-80 text-center mx-auto mt-5 text-xs'>To keep track of your transactions. Go to account page and click "Transactions".</Text>

      <Pressable 
      onPress={() => router.replace("/(tenant)/(tabs)/home")}
      android_ripple={{color: "white"}}
      style={{backgroundColor: "#444"}}
      className='flex-row items-center justify-center p-3 rounded-md mt-10'>
        <Ionicons name='home-outline' size={15} color={"white"}/>
        <Text className='text-white ml-2'>Back to Home</Text>
      </Pressable>
    </SafeAreaView>
  )
}