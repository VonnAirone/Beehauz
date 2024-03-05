import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function BackButton() {
  return (
    <View className='mt-5 absolute top-6 left-5'>
        <Pressable onPress={() => router.back()}>
            <View className='flex-row items-center '>
                <Ionicons name='chevron-back-outline' size={28}/>
                <Text className='text-lg'>Back</Text>
            </View>
        </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({})