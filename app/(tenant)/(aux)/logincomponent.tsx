// TextInputField.js
import React, { useState } from 'react';
import { Text, TextInput, View, Pressable, Image, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export function Logo () {
  return (
    <View className='mb-5 flex flex-row items-center w-80 justify-center'>
      <View>
        <Image className='w-10 h-10' style={{ resizeMode: 'contain' }} source={require("@/assets/images/icon.png")} />
      </View>
      <View>
        <Text className='text-2xl font-semibold'>BEEHAUZ</Text>
      </View>
    </View>
  )
}

export function TextInputField({ label, value, placeholder, isPassword, isRevealed, onChangeText, onPressReveal, feedbackText, isEditable, defaultFeedback }) {
  return (
    <View>
      <Text className='p-2 font-semibold'>{label}</Text>
      <View className='justify-center'>
        <TextInput
          editable={isEditable}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={feedbackText ? 'red' : 'gray'}
          className={`p-2 text-xs pl-5 border border-gray-200 focus:border-gray-400 rounded-md w-80 ${
            feedbackText ? 'border-red-500' : value.trim() === '' ? '' : 'border-gray-400'
          }`}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isRevealed}
        />

        {isPassword && (
          <View className='absolute right-5'>
            <Pressable onPress={onPressReveal}>
              <Ionicons name={isRevealed ? 'eye-off-outline' : 'eye-outline'} size={20} />
            </Pressable>
          </View>
        )}
      </View>

      
        <View>
        {feedbackText ? (
          <Text className='ml-5 text-red-500 text-xs'>{feedbackText}</Text>
        ): (
        <Text className='ml-5 text-xs text-gray-500'>
          {defaultFeedback}
        </Text>
        )}
        </View>
      
    </View>
  );
}


export function Button({ onPress, text, loading }) {
  return (
    <Pressable onPress={onPress}>
      <Text className={`p-2 text-center bg-yellow-500 w-80 rounded-sm ${loading ? 'text-white' : 'text-black'}`}>
        {loading ? 'LOADING' : text}
      </Text>
    </Pressable>
  );
}


export function CheckEmail({ email, actionType }) {
  
  const openEmail = async () => {
    const gmailUrl = 'https://mail.google.com/mail/u/?authuser=user@gmail.com';

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

  const [userEmail, setUserEmail] = useState('')
  const [isEmailEmpty, setIsEmailEmpty] = useState(false)

  const forgotPassword = async () => {

    try {
      if (userEmail.trim() === '') {
        setIsEmailEmpty(true);
      } else {
        setIsEmailEmpty(false)
        // redirect link is missing
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, { redirectTo: '' });
  
        if (error) {
          Alert.alert('Error resetting password', error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error message:', error.message);
    }
  };

  return (
    <View>    

      <View className='absolute -top-24 items-center left-2 w-full z-10'>
        {/* {actionType == 'confirmation' ? (<Image source={require("@/assets/checkemailicon.png")} />) : (<Image source={require("@/assets/forgotpasswordicon.png")} />)}
         */}
      </View>

      <View className='z-0 w-96 px-8 bg-white shadow-2xl border border-gray-200 justify-center rounded-md'>
        <Text className='text-center text-base mt-16'>
          {actionType === 'confirmation'
            ? 'Hi there! Welcome to Beehauz! To boost your experience, we would like to ask you to confirm your email associated with your account.'
            : 'Forgot your password? No worries! We can help you reset it. Please check your email for further instructions.'}
        </Text>

        <Text className='text-center mt-5 text-xs'>You've registered {email} as your email account.</Text>

        {actionType === 'confirmation' ? ( 
        <View className='w-60 mx-auto rounded-md overflow-hidden border border-gray-200 mt-2 mb-10'>
          <Pressable
            onPress={openEmail}
            android_ripple={{ color: '#FCA311' }}
            className='p-4'>
            <Text className='text-center'>CHECK EMAIL</Text>
          </Pressable>
        </View>) : (
          <View>
            <View className='flex flex-row items-center mt-2'>
              <TextInput 
              value={userEmail} 
              onChangeText={(text) => {setUserEmail(text), setIsEmailEmpty(false)}}
              className={`mx-auto w-60 rounded-md overflow-hidden border border-gray-200 p-3 ${isEmailEmpty ? 'border-red-300' : 'border-gray-300'}`} placeholder='Enter email address'/>
              <Pressable
              onPress={openEmail} 
              className='w-10 items-center'>
                <Ionicons name='send' size={32}/>
              </Pressable>
            </View>

            <View className='mb-10 ml-5 mt-1'>
              {isEmailEmpty && (<Text className='text-gray-500 text-xs'>Please enter an email address</Text>)}
            </View>
            
          </View>
        )}

      </View>
    </View>
  );
}


