import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/app/components/back-button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function IDVerificationPage() {
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

        <View className='flex-row items-center justify-center mt-10'>
          <Image className='w-10 h-10' source={require("@/assets/images/icon.png")}/>
          <Text className='text-xl font-semibold pr-2'>BEEHAUZ</Text>
        </View>

        <View className='items-center mt-10'>
          <Text className='font-medium text-lg'>Submit documents</Text>
          <Text className='text-center w-80 mt-2'>We need to verify your information. Please submit the documents below to verify your identity.</Text>
        </View>
        

        <View className='gap-y-4 mt-10'>
          <View className='flex-row items-center p-3 bg-gray-200 rounded-md'>
              <Ionicons name='id-card-outline' size={28} color={'#444'}/>
              <View className='ml-3'>
                <Text className='text-xs text-gray-400'>Step 1</Text>
                <Text className='text-base font-medium'>Photo ID</Text>
              </View> 
          </View>

          <View className='flex-row items-center p-3 bg-gray-200 rounded-md'>
              <Ionicons name='camera-outline' size={28} color={'#444'}/>
              <View className='ml-3'>
                <Text className='text-xs text-gray-400'>Step 2</Text>
                <Text className='text-base font-medium'>Take a Selfie</Text>
              </View> 
          </View>

          <View className='flex-row items-center p-3 bg-gray-200 rounded-md'>
              <Ionicons name='document-outline' size={28} color={'#444'}/>
              <View className='ml-3'>
                <Text className='text-xs text-gray-400'>Step 3</Text>
                <Text className='text-base font-medium'>Upload Documents</Text>
              </View> 
          </View>
         
        </View>

        <View className='top-48'>
          <Pressable
          android_ripple={{color: 'white'}}
          onPress={() => router.push("/(owner)/(verification)/StepOne")}
          className='bg-gray-900 p-3 rounded-md'>
            <View>
              <Text className='text-center text-white font-medium'>PROCEED</Text>
            </View>
          </Pressable>
        </View>
        
      </View>


     

    </SafeAreaView>
  )
}