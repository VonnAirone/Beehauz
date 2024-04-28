import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PaymentConfirmation() {
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <Text>PaymentConfirmation</Text>
      </View>
    </SafeAreaView>
  )
}