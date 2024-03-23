import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Button({text, onPress}) {
  return (
    <View className='rounded-sm overflow-hidden'>
        <Pressable onPress={onPress} android_ripple={{color: '#ffa233'}} className='bg-black w-80 rounded-md'>
            <Text className='text-white text-center text-lg font-bold bg-yellow p-2 tracking-wide'>{text}</Text>
        </Pressable>
    </View>

  )
}