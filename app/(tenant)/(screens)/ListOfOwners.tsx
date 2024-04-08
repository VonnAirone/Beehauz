import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ListOfOwners() {
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
          <View>
            <Text className='font-semibold'>Messages</Text>
          </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})