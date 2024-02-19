import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function OnBoardingLayout() {
  return (
    <Stack screenOptions={{headerShown: true, headerTransparent: true}}>
      <Stack.Screen name='TenantRegistration' options={{headerShown: false}}/>
      <Stack.Screen name='OwnerRegistration' options={{headerShown: false}}/>
      <Stack.Screen name='Splashscreen' options={{headerShown: false}}/>
      <Stack.Screen name='Usertype' options={{headerTitle: 'Back'}}/>
    </Stack>
  )
}

const styles = StyleSheet.create({})