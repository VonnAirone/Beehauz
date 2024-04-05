import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'

export default function LoadingComponent() {
  return (
    <View className='flex-1 items-center justify-center'>
      <LottieView
      autoPlay
      style={{width: 60, height: 60}}
      source={require("@/assets/loading.json")}/>
    </View>
  )
}

const styles = StyleSheet.create({})