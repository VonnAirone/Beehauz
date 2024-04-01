import { StyleSheet, View, Image, Text, ImageBackground} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '@/components/button'

export default function OnboardPage() {
  return (
    <SafeAreaView className='flex-1'>
      <ImageBackground 
      style={{flex: 1, justifyContent: 'center'}}
      resizeMode='cover'
      source={require("@/assets/images/background.png")}/>


      <View className='flex-1 p-5 z-10 bottom-5 absolute self-center'>
        <View className='h-12 w-12'>
          <Image 
          style={{width: "100%", height: "100%"}}
          source={require("@/assets/icon.png")}/>
        </View>

        <View className='mb-3'>
          <Text className='text-xl font-semibold font-display'>Begin your Search</Text>
        </View>

        <View className='mb-10'>
          <Text>Discover hassle-free boarding house living with our convenient mobile app.</Text>
        </View>

        <Button text={"Enter Beehauz"} onPress={undefined}/>
      </View>
     
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})