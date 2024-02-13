import { StyleSheet, View, Image, Text, Pressable } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Animated, { BounceIn, BounceOut, useAnimatedRef } from "react-native-reanimated";
import { router } from 'expo-router';

export default function Splashscreen() {
  const animation = useRef()

  return (
    <View className='flex-1  bg-yellow-500'>
      <Animated.View className='top-96' entering={BounceIn.duration(1000)} exiting={BounceOut.springify()}>
        <View className='flex-row items-center align-middle p-2 justify-center' >
          <Image className='w-20 h-20' source={require("@/assets/images/icon.png")}/>
          <Text className='text-5xl font-bold top-1'>BEEHAUZ</Text>
        </View>
        <View className='items-center'>
          <Pressable className='w-24 items-center p-2' onPress={() => router.push("/(onboarding)/TenantRegistration")}>
            <Text>Enter</Text>
          </Pressable>
        </View>

      </Animated.View>


    </View>
  )
}

const styles = StyleSheet.create({})