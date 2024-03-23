import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'

export default function LoadingComponent() {
  return (
    <View className='flex-1 items-center justify-center'>
      <LottieView
      autoPlay
      style={{width: 40, height: 40}}
      source={require("@/assets/bee.json")}/>

      <Text>Loading...</Text>
    </View>
  )
}

const styles = StyleSheet.create({})