import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';
import LottieView from 'lottie-react-native'
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const OnboardingTenant = () => {
  const animation = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showText, setShowText] = useState(true)

  const onPageSelected = (event) => {
    setCurrentPage(event.nativeEvent.position);
  };

  const isLastPage = currentPage === 2;

  return (
    <View className='flex-1'>
        <View className='absolute w-full flex-col top-10 right-5'>
          <Pressable 
          onPress={() => router.push("/Register")}
          className='flex-row items-center justify-end'>
            <View>
              <Ionicons name='close-outline' size={32}/>
            </View> 
            <Text className='text-right'>Skip</Text>
          </Pressable>
        </View>
        <View className='absolute w-full top-28'>
          <Text className='text-center text-4xl font-semibold'>
            BEEHAUZ APP
          </Text>
        </View>
      <View className='flex-1 relative -left-0 top-20'>
        <LottieView
          autoPlay
          ref={animation}
          style={{ width: 400, height: 400}}
          source={require('assets/Animated Bee.json')}
        />
      </View>

      <PagerView className='flex-1 z-0 relative bottom-20' initialPage={0} onPageSelected={onPageSelected}>
        <View className='items-center justify-center px-10' key="1">
          <Text className='text-2xl text-center font-bold italic'>Simplify your boarding house hunt with our innovative portal.</Text>
          <View className='top-3'>
            <Ionicons name='arrow-forward-outline' size={32}/>
          </View>
          
        </View>
        <View className='items-center justify-center px-10' key="2">
        <Text className='text-2xl text-center font-bold italic'>Simplify Your Boarding House Hunt with Our Innovative Portal.</Text>
        </View>
        <View className='items-center justify-center px-10' key="3">
        <Text className='text-2xl text-center font-bold italic'>Simplify Your Boarding House Hunt with Our Innovative Portal.</Text>
        </View>
      </PagerView>

      <View className='bottom-10 flex-row justify-center gap-3'>
        {[0, 1, 2].map((index) => (
          <View
            className={`w-2 h-2 rounded-full ${currentPage === index ? 'bg-yellow-500' : 'bg-slate-400'}`}
            key={index}
          />
        ))}
      </View>

      {isLastPage && (
        <View className='absolute bottom-8 right-10 rounded-sm overflow-hidden'>
          <Pressable 
          onPress={() => router.push("/Register")}
          android_ripple={{color: '#fdfdd9'}} 
          className='bg-yellow-500 p-2'>
            <Text>Next Page</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default OnboardingTenant;
