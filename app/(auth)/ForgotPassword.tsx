import { Alert, Image, KeyboardAvoidingView, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { supabase } from 'utils/supabase'
import { router } from 'expo-router'
import Button from 'components/button'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [isEmailEmpty, setIsEmailEmpty] = useState(false)

    const forgotPassword = async () => {
        try {
          setLoading(true);
      
          if (email.trim() === '') {
            setIsEmailEmpty(true);
          } else {
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: '' });
      
            if (error) {
              Alert.alert('Error resetting password', error.message);
            } else {
              router.push('/(auth)/Login');
            }
          }
        } catch (error) {
          Alert.alert('Error message:', error.message);
        } finally {
          setLoading(false);
        }
      };
      
  return (
    <KeyboardAvoidingView className='container flex-1 justify-center'>
      {/* <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> */}
        
            <View className='items-center flex-col gap-5'>
                <View>
                    <Image source={require('assets/forgotpasswordicon.png')}/>
                </View>
                <View className='items-center'>
                    <Text className='font-semibold text-2xl mb-3'>Forgot Password</Text>
                    <Text className='w-80 text-center'>Enter the email associated to our account to receive reset instructions.</Text>
                </View>
            
                <View className='mb-4'>
                    <TextInput className={`border w-80 p-3 rounded-full pl-7 ${isEmailEmpty && email.trim() === '' ? 'border-red-500' : ''}`}
                    placeholder='Enter your email address.'
                    placeholderTextColor={isEmailEmpty ? 'red' : 'black'}
                    onChangeText={(text) => { setIsEmailEmpty(false); setEmail(text)}}/>

                    <View className={`w-80 pl-5 text-xs absolute top-14`}>
                        <Text className={isEmailEmpty? 'text-red-500' : 'hidden'}>An email is required upon reset.</Text>
                    </View>
                </View>
                
                <View>
                    <Button text={loading ? 'LOADING' : 'RESET PASSWORD'} onPress={forgotPassword}/>
                </View>  
            </View>
        {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>
  )
}