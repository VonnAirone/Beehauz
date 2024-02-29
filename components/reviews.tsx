import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function Reviews() {
  return (
    <View className='p-2 gap-y-2'> 
        <View className='flex-row'>  
        {Array.from({length: 5}, () => (
        <Ionicons name='star-outline' size={15}/>
        ))}
        </View>
        <Text className='text-base'>4.5k reviews</Text>
    </View>
  )
}

const styles = StyleSheet.create({})