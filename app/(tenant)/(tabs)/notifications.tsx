import { Pressable, Text, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Notifications() {
  
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <View className='flex-row items-center justify-between mb-4'>
          <View>
            <Text className='text-xl font-semibold'>Notifications</Text>
          </View>

          <Pressable 
          style={{backgroundColor: "#444"}}
          onPress={() => {}}
          android_ripple={{color: "white"}}
          className='p-3 rounded-md'>
            <Ionicons name='trash' color={"white"} size={20}/>
          </Pressable>
        </View>

        <View>
          
        </View>
      </View>
    </SafeAreaView>
  )
}