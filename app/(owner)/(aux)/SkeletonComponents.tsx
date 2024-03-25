import { StyleSheet, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export const HomepageSkeleton = () => {
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <View className='bg-gray-100 w-40 h-7 rounded-md'/>
        <View className='bg-gray-100 w-40 h-3 rounded-md mt-2'/>

        <View className='flex-row items-center justify-around mt-10'>
          <View className='shadow-lg w-36 p-4 h-32 bg-gray-100 rounded-md'/>
          <View className='shadow-lg w-36 p-4 h-32 bg-gray-100 rounded-md'/>
        </View>

        <View className='flex-row items-center justify-around mt-5'>
          <View className='shadow-lg w-36 p-4 h-32 bg-gray-100 rounded-md'/>
          <View className='shadow-lg w-36 p-4 h-32 bg-gray-100 rounded-md'/>
        </View>

        <View className='mt-8 border-2 border-gray-200'></View>

        <View className='mt-3 h-4 w-32 bg-gray-100 rounded-md'/>

        <View className='mt-3 h-32 w-full bg-gray-100 rounded-md'/>
      </View>
     
    </SafeAreaView>
  )
}


export const BookingSkeleton = () => {
  return (
    <>
    <View className='bg-gray-100 mt-3 rounded-md mb-2 h-3 w-20'></View>
    <View className='bg-gray-50 rounded-md mb-1 p-5'>
      <View className='bg-gray-100 h-3 w-20 rounded-md'/>
      <View className='bg-gray-100 h-5 w-32 rounded-md mt-3'/>
      <View className='bg-gray-100 h-3 w-40 rounded-md mt-2'/>
      <View className='bg-gray-100 h-3 w-24 rounded-md mt-2'/>

      <View className='border-b-2 border-gray-100 my-3'></View>

      <View className='bg-gray-100 h-3 w-24 rounded-md mt-2'/>
      <View className='bg-gray-100 h-3 w-24 rounded-md mt-2'/>
      <View className='bg-gray-100 h-3 w-24 rounded-md mt-2'/>

      <View className='bg-gray-100 h-3 w-40 rounded-md mt-5'/>
      <View className='flex-row justify-between'>
        <View className='bg-gray-100 py-5 w-32 rounded-md mt-1'/>
        <View className='bg-gray-100 py-5 w-32 rounded-md mt-1'/>
      </View>
    </View>
  </>
  )
}