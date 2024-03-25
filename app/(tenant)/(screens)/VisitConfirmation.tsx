import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import LottieView from 'lottie-react-native'
import { router } from 'expo-router'

export default function VisitConfirmation() {
  return (
    <SafeAreaView className='flex-1 justify-center items-center'>
      <View className='p-5'>

        <View className='mb-2'>
          <LottieView
          style={{width: 100, height: 100}}
          source={require("@/assets/success.json")}/>
        </View>

        <View className='mb-4'>
          <Text className='text-lg font-semibold text-center'>Thank you for your visit booking request.</Text>
          <Text className='text-center'>We have received your request to visit the property.</Text>
        </View>


        <View className='p-5 bg-gray-100 rounded-md shadow-2xl'>
          <View className='mb-4'>
            <Text className='font-semibold'>Visit Details</Text>
          </View>
          

          <View className='flex-row items-center justify-between my-1'>
            <Text className='opacity-60'>Date:</Text>
            <Text>March 15, 2024</Text>
          </View>

          <View className='flex-row items-center justify-between my-1'>
            <Text className='opacity-60'>Time:</Text>
            <Text>10:00 AM</Text>
          </View>

          <View className='flex-row items-center justify-between my-1'>
            <Text className='opacity-60'>Property:</Text>
            <Text>Villa Villasor</Text>
          </View>
        </View>

        <View className='gap-y-2 mt-5'>
          <Text>Please note that your booking is currently pending confirmation. The owner will review your request and send you a confirmation via text or email as soon as possible.</Text>

          <Text className='text-xs'>If you have any urgent inquiries or need to make changes to your booking, please feel free to contact us directly.
          </Text>
        </View>
      </View>

      <View className='items-center absolute bottom-8'>
          <TouchableOpacity 
          onPress={() => router.replace('/home')}
          className='flex-row items-center gap-x-2'>
            <Ionicons name='home-outline' size={15} color={"#ffa233"}/>
            <Text className='text-yellow'>Back to Home</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}