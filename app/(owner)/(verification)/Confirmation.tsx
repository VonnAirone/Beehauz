import { View, Text, Image, Pressable} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LoadingComponent from '@/app/components/LoadingComponent'
import LottieView from 'lottie-react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function Confirmation() {
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5 flex-1'>
        <View className='flex-row items-center justify-center mt-10'>
          <Image className='w-10 h-10' source={require("@/assets/images/icon.png")}/>
          <Text className='text-xl font-semibold pr-2'>BEEHAUZ</Text>
        </View>
        
        <Text className='text-center font-medium text-2xl mt-5'>Verification in Progress</Text>
        <Text className='text-center text-xs mx-auto italic mt-3'>The verification process usually takes up 1-2 business days. This will help ensure your identity as a property owner as well as to protect the Beehauz community from potential scam.</Text>

        <View className='self-center top-20'>
          <Image className='w-72 h-72' source={require("@/assets/images/security.png")}/>
        </View>
       

        <Pressable 
        onPress={() => router.push("/(owner)/(tabs)/Dashboard")}
        className='rounded-md w-72 mx-auto absolute bottom-5 self-center'
        android_ripple={{color: "white"}}
        style={{backgroundColor: "#444"}}>
          <View className='flex-row items-center p-3 justify-center'>
            <Ionicons name='home-outline' color={'white'}/>
            <Text className='ml-1 text-white'>Back to Home</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}