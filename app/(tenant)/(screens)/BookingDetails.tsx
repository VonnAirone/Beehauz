import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { Ionicons } from '@expo/vector-icons'

export default function BookingDetails() {
  return (
    <SafeAreaView className='flex-1'>
        <BackButton/>
        <View className='mt-5 items-center'>
            <Text className='text-2xl font-semibold'>Booking Details</Text>
        </View>

        <View className='p-5'>
            <View>
                <Text className='text-2xl'>Name of Boarding House</Text>
            </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})