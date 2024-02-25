// TextInputField.js
import React from 'react';
import { Text, TextInput, View, Pressable, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function TextInputField({ label, value, placeholder, isPassword, isRevealed, onChangeText, onPressReveal, feedbackText, isEditable }) {
  return (
    <View>
      <Text className='p-2'>{label}</Text>
      <View className='relative justify-center'>
        <TextInput
          editable={isEditable}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={feedbackText ? 'red' : 'gray'}
          className={`p-3 pl-5 border border-gray-200 focus:border-gray-400 rounded-sm w-80 ${
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

      
        <View className='h-4'>
        {feedbackText && (
          <Text className='ml-5 mt-1 text-red-500 text-xs'>
            {feedbackText} 
          </Text>
        )}
        </View>
      
    </View>
  );
}


export function Button({ onPress, text, loading }) {
  return (
    <Pressable onPress={onPress}>
      <Text className={`p-4 text-center bg-yellow-500 w-80 rounded-sm ${loading ? 'text-white' : 'text-black'}`}>
        {loading ? 'LOADING' : text}
      </Text>
    </Pressable>
  );
}


export function CheckEmail({ email, actionType, closeModal }) {
  const openEmail = async () => {
    let emailUrl = `mailto:${email}`;
    
    if (Platform.OS === 'android') {
      emailUrl = 'intent://compose/#Intent;package=com.google.android.gm;scheme=mailto;end';
    }

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        console.error('Opening email not supported');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>    
      <Pressable 
      onPress={() => closeModal()}
      className='absolute right-3 top-3 z-10'>
        <Ionicons name='close'/>
      </Pressable>
      <View className='absolute -top-24 items-center left-2 w-full z-10'>
        {actionType == 'confirmation' ? (<Image source={require("@/assets/checkemailicon.png")} />) : (<Image source={require("@/assets/forgotpasswordicon.png")} />)}
        
      </View>

      <View className='z-0 h-60 w-96 px-8 bg-white shadow-2xl justify-center rounded-md'>
        <Text className='text-center text-base mt-10'>
          {actionType === 'confirmation'
            ? 'Hi there! Welcome to Beehauz! To boost your experience, we would like to ask you to confirm your email associated with your account.'
            : 'Forgot your password? No worries! We can help you reset it. Please check your email for further instructions.'}
        </Text>

        <Text className='text-center mt-5'>You've registered {email} as your email account.</Text>

        {actionType === '' ? ( 
        <View className='w-60 mx-auto rounded-md overflow-hidden border border-gray-200 mt-2'>
          <Pressable
            onPress={openEmail}
            android_ripple={{ color: '#FCA311' }}
            className='p-3'>
            <Text className='text-center'>CHECK EMAIL</Text>
          </Pressable>
        </View>) : (
          <View>
            <TextInput className='w-60 mx-auto rounded-md overflow-hidden border border-gray-200 mt-2 p-3' placeholder='Enter email address'/>
          </View>
        )}

      </View>
    </View>
  );
}


