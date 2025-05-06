import { View, Text, Pressable, Linking } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Logo from '@/app/components/logo'

export default function ConfirmEmail() {

  const openEmail = async () => {
    const gmailUrl = 'https://mail.google.com/mail/u/?authuser=user@gmail.com';

    const androidGmailUrl = `intent://send/${gmailUrl}#Intent;scheme=mailto;package=com.google.android.gm;end`;

    try {
       const supported = await Linking.canOpenURL(gmailUrl);
       if (supported) {
          await Linking.openURL(gmailUrl);
       } else {
          console.error('Opening Gmail not supported');
       }
    } catch (error) {
       console.error(error);
    }
 }
 
  return (
    <SafeAreaView className='flex-1 justify-center items-center'>
      <View className=''>
        <Logo/>
      </View>
      
      <View className='w-80'>
        <Text className='font-semibold text-lg text-center'>Congratulations!</Text>
        <Text className='text-center mt-4'>You've successfully registered with Beehauz.</Text>
      </View>

      <View className='w-80 mt-4'>
        <Text className='text-center'>
        To complete your registration and activate your account, please check your email inbox for a confirmation message. Click the link provided in the email to confirm your email address.
        </Text>

        <View className='rounded-md overflow-hidden mt-10'>
          <Pressable
          onPress={() => openEmail()} 
          android_ripple={{color: "white"}}
          style={{backgroundColor: "#444"}}
          className='flex-row items-center p-3 justify-center rounded-md'>
            <Text className='text-white uppercase font-semibold'>Confirm Email</Text>
            <Ionicons name='chevron-forward' color={"white"} size={20}/>
          </Pressable>
        </View>
        <Text className='text-xs mt-2'>If you haven't received the email, please check your spam folder </Text>

      </View>
    </SafeAreaView>
  )
}