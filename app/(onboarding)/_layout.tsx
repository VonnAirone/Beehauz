import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function OnBoardingLayout() {
  return (
    <Stack screenOptions={{headerTransparent: true, headerShown: false}}>
      <Stack.Screen name='Usertype' options={{headerTitle: 'Back'}}/>
    </Stack>
  )
}

const styles = StyleSheet.create({})