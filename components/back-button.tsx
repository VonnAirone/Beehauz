import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function BackButton() {
  return (
    <View>
        <Pressable 
         className='w-14'
        onPress={() => router.back()}>
            <View className='flex-row items-center '>
                <Ionicons name='chevron-back-outline' size={20}/>
                <Text>Back</Text>
            </View>
        </Pressable>
    </View>
  )
}