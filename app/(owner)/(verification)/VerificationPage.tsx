import { View, Text, Pressable, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/app/components/back-button';
import { router } from 'expo-router';

export default function VerificationPage() {
  const [status, setStatus] = useState(false);

  function handleSubmission () {
    if (status === false) {
      Alert.alert('Please ensure that you have checked the box.')
    } else {
      router.push("/(owner)/(verification)/VerificationPageOne")
    }
  }

  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton />
      </View>
      
      <View className='flex-1 items-center'>

        <View className='flex-row items-center justify-center'>
          <Image className='w-10 h-10' source={require("@/assets/images/icon.png")}/>
          <Text className='text-xl font-semibold pr-2'>BEEHAUZ</Text>
        </View>

        <View className='items-center top-28'>
          <Ionicons name='shield' color={'#444'} size={100}/>
          <Text className='font-semibold text-lg text-center mt-2'>Let's get you verified.</Text>
          <Text className='text-center mt-2 w-80'>Please verify your identity to continue using Beehauz services. This is to keep you safe and to protect the Beehauz community from potential harm.</Text>
        </View>
       

      
        
        <View className='absolute bottom-5'>
          <TouchableOpacity
            onPress={() => setStatus(!status)}
            className='mt-20 w-72 mb-3'>
            <View className='flex-row items-start'>
              {status ? (
                <Ionicons name='checkbox-outline' size={24}/>
              ) : (
                <Ionicons name='square-outline' size={24}/>
              )}
              <Text className='text-xs ml-1'>By acknowledging this, you understand that Beehauz will be collecting sensitive information, including identification cards, business permits, and other relevant documents.</Text>
            </View>
          </TouchableOpacity>

          <Pressable
          android_ripple={{color: 'white'}}
            onPress={handleSubmission}
            className='bg-gray-900 p-3 w-80 rounded-md'>
            <View>
              <Text className='text-center text-white'>Get Verified</Text>
            </View>
          </Pressable>
        </View>
      
      </View>
    </SafeAreaView>
  );
}
