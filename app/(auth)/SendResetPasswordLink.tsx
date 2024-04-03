import { Text, View, TextInput, Pressable, Alert, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Logo } from '../(tenant)/(aux)/logincomponent'
import { Ionicons } from '@expo/vector-icons'
import BackButton from '@/components/back-button'
import { supabase } from '@/utils/supabase'

export default function SendResetPasswordLink() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  
  async function sendLink() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "com.beehauz://PasswordChange"
      }
    );
    if (!error) {
      setLoading(false);
      Alert.alert("A reset password link was sent to you via email. Please check it.")
    } else {
      setEmail('')
      setLoading(false);
      alert(error.message);
    }
  }
  
  useEffect(() => {
    console.log(email)
  }, [])

  const handleEmailChange = (text) => {
    setEmail(text)
  } 
  
  return (
    <KeyboardAvoidingView className='flex-1'>
    <SafeAreaView className='flex-1 justify-center items-center'>
      <View className='p-5 absolute top-5 left-0'>
        <BackButton/>
      </View>
      
      <View className='p-5'>
        <View>
          <Logo/>
        </View>
        
        <View>
          <Text className='font-semibold text-lg text-center'>Forgot your password?</Text>
          <Text className='text-center mt-4'>No worries! We can help you reset it. Please enter the email associated with your account to receive a password reset link.</Text>
        </View>

        <View className='w-80 mx-auto mt-4'>
          <View className='mt-10 flex-row gap-x-2'>
            <TextInput
            onChangeText={(text) => handleEmailChange(text)}
            className='flex-row items-center px-3 py-2 justify-center rounded-md border border-gray-700 grow'
            placeholder='Enter email'/>
            
            <View className='rounded-md overflow-hidden'>
              <Pressable 
              onPress={sendLink}
              android_ripple={{color: 'white'}}
              style={{backgroundColor: "#444"}} 
              className='p-3 rounded-md flex-row items-center'>
                <Text className='text-white mr-2'>Send</Text>
                <Ionicons name='send' color={"white"} size={20}/>
              </Pressable>
            </View>
          </View>

          <Text className='text-xs mt-2'>If you haven't received the email, please check your spam folder </Text>

        </View>
      </View> 
    </SafeAreaView>
  </KeyboardAvoidingView>
  )
}