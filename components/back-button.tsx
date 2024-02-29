import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function BackButton() {
  return (
    <View className='mt-5 ml-3 mb-3'>
        <Pressable onPress={() => router.back()}>
            <View className='flex-row items-center '>
                <Ionicons name='chevron-back-outline' size={32}/>
                <Text className='text-xl'>Back</Text>
            </View>
        </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({})