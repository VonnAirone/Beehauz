import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function PropertySuccess() {
  return (
    <SafeAreaView className='flex-1 justify-center items-center'>
      <View className='items-center gap-y-2 mt-5'>
        <Text className='text-xl'>Congratulations!</Text>
        <Text>You have successfully created your property!</Text>
      </View>

      <View className='overflow-hidden rounded-md mt-5'>
        <Pressable 
        onPress={() => router.push("/PropertyView")}
        android_ripple={{color: "#fdffd9"}}
        className='flex-row items-center justify-center bg-yellow p-3 w-60'>
          <Text>Proceed to Property</Text>
          <Ionicons name='chevron-forward-outline'/>
        </Pressable>
      </View>
      
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})