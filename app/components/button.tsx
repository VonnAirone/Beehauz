import { Pressable, Text, View } from 'react-native'
import React from 'react'

export default function Button({text, onPress}) {
  return (
    <View className='rounded-md overflow-hidden'>
        <Pressable 
        onPress={onPress} 
        style={{backgroundColor: "#ff8b00"}}
        android_ripple={{color: '#ffa233'}} 
        className='rounded-md'>
            <Text className='text-white text-center text-lg font-bold p-2 tracking-widest'>{text}</Text>
        </Pressable>
    </View>

  )
}