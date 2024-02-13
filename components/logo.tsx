import { Text, View, Image } from 'react-native'
import React from 'react'

export default function Logo() {
  return (
    <View className='flex-row items-center p-2 justify-center' >
      <Image className='w-12 h-12' source={require("../assets/images/icon.png")}/>
      <Text className='text-lg pr-2'>BEEHAUZ</Text>
    </View>
  )
}