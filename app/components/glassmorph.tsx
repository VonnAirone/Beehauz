import { StyleSheet, Text, View } from 'react-native'
import React, { Children } from 'react'

export default function Glass({children}) {
  return (
    <View className="p-4 my-2 bg-gray-200 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100">
        {children}
    </View>
  )
}
