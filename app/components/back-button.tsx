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
                <Ionicons name='chevron-back-outline' color={'#ff8b00'} size={20}/>
                <Text style={{color: '#ff8b00'}}>Back</Text>
            </View>
        </Pressable>
    </View>
  )
}