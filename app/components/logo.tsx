import { Text, View, Image } from 'react-native'
import React from 'react'

export default function Logo() {
  return (
    <View className='flex-row items-center justify-center' >
      <Image className='w-10 h-10' source={require("../../assets/images/icon.png")}/>
      <Text className='text-3xl font-semibold pr-2'>BEEHAUZ</Text>
    </View>
  )
}