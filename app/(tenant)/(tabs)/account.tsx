import { Pressable, SafeAreaView, Text, View, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import Divider from 'react-native-divider'
import Logo from '@/components/logo'
import { router } from 'expo-router'

export default function Account() {
  return (
    <SafeAreaView className='flex-1 w-96 justify-center m-auto'>
      <View className='absolute top-0 left-72 opacity-10'>
        <Image className='h-60 w-60' source={require("assets/honeyv3.png")}/>
      </View>
      <View className='items-center p-3'>
        <View className='bg-gray-300 h-20 w-20 rounded-full mb-3'></View>
        
        <View className='ml-3 items-center'>
          <Text className='font-semibold text-2xl mr-1'>Username</Text>
          <View className='flex-row items-center '>
            <Ionicons name='location-outline' size={20}/>
            <Text>Location of the user</Text>
          </View>
        </View>
      </View>

      <Divider orientation="center"></Divider>

      <View className='items-center w-80 mx-auto'>
        <Text className='text-center'>Welcome to Beehauz! It looks like you're not on board yet. Let's find the perfect place for you to stay. Explore our listings and discover comfortable accommodations that suit your preferences. Start your journey now!</Text>

        <Pressable 
        // onPress={() => router.push('/(tenant)/(tabs)/home')}
        android_ripple={{color: 'yellow'}} 
        className='bg-yellow-500 p-3 rounded-sm flex-row items-center mt-3'>
          <Text>Find now</Text>
          <Ionicons name='chevron-forward-outline'/>
        </Pressable>
      </View>

      <Divider orientation="center"></Divider>

      <View className='items-center gap-3'>

        {/* ACCOUNT MANAGEMENT */}
        <View className='flex-row w-80 h-20 items-center p-5 border border-gray-200 rounded-md relative'>
          <Ionicons name='person-outline' color={"#f8b000"} size={32}/>
          <View className='ml-5'>
            <Text className='font-semibold text-xl'>Account management</Text>
            <Text className='text-xs'>Username, password, personal information</Text>
          </View>
          <View className='absolute right-3'>
            <Ionicons name='chevron-forward-outline' size={28}/>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View className='flex-row w-80 h-20 items-center p-5 border border-gray-200 rounded-md relative'>
          <Ionicons name='document-text-outline' color={"#f8b000"} size={32}/>
          <View className='ml-5'>
            <Text className='font-semibold text-xl'>Transaction History</Text>
            <Text className='text-xs w-40'>Booking history, payment method, payment history</Text>
          </View>
          <View className='absolute right-3'>
            <Ionicons name='chevron-forward-outline' size={28}/>
          </View>
        </View>

        {/* HELP CENTER */}
        <View className='flex-row w-80 h-20 items-center p-5 border border-gray-200 rounded-md relative'>
          <Ionicons name='help-circle-outline' color={"#f8b000"} size={32}/>
          <View className='ml-5'>
            <Text className='font-semibold text-xl'>Help Center</Text>
            <Text className='text-xs w-40'>FAQs, Policies and Terms of Service</Text>
          </View>
          <View className='absolute right-3'>
            <Ionicons name='chevron-forward-outline' size={28}/>
          </View>
        </View>

        {/* RATE THIS APP */}
        <View className='flex-row w-80 h-20 items-center p-5 border border-gray-200 rounded-md relative'>
          <Ionicons name='star-half-outline' color={"#f8b000"} size={32}/>
          <View className='ml-5'>
            <Text className='font-semibold text-xl'>Rate this App</Text>
            <Text className='text-xs w-40'>Feedback, experiences, ratings</Text>
          </View>
          <View className='absolute right-3'>
            <Ionicons name='chevron-forward-outline' size={28}/>
          </View>
        </View>

      </View>
        
    </SafeAreaView>
  )
}
