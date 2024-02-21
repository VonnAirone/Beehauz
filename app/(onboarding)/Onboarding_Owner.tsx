import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import Logo from '@/components/logo'
import { SafeAreaView } from 'react-native-safe-area-context'
import PagerView from 'react-native-pager-view';

export default function Onboarding_Owner() {
  const animation = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const onPageSelected = (event) => {
    setCurrentPage(event.nativeEvent.position);
  };

  const isLastPage = currentPage === 2;
  return (
    <SafeAreaView className='flex-1 justify-center'>
      <View>
        <Logo/>
      </View>
      
      <PagerView className='h-96' initialPage={0} onPageSelected={onPageSelected}>
        <View key={1}>
          <Text className='text-center font-semibold text-2xl w-80 mx-auto'>
          We can help you find unique accommodations online.
          </Text>
          <View className='items-center mt-10'>
            <Image source={require("@/assets/images/image_one_onboard_owner.png")}/>
          </View>
        </View>
        <View key={2}>
          <Text className='text-center font-semibold text-2xl w-80 mx-auto'>
          We can help you find unique accommodations online.
          </Text>
          <View className='items-center mt-10'>
            <Image source={require("@/assets/images/image_one_onboard_owner.png")}/>
          </View>
        </View>
        <View key={3}>
          <Text className='text-center font-semibold text-2xl w-80 mx-auto'>
          We can help you find unique accommodations online.
          </Text>
          <View className='items-center mt-10'>
            <Image source={require("@/assets/images/image_one_onboard_owner.png")}/>
          </View>
        </View>
      </PagerView>

      <View className='items-center mt-10'>
        <Text className='text-base w-80 mx-auto text-center'>Effortless Boarding House Management at Your Fingertips.</Text>
      </View>

      <View className='flex-row justify-center gap-3 mt-5'>
        {[0, 1, 2].map((index) => (
          <View
            className={`w-2 h-2 rounded-full ${currentPage === index ? 'bg-yellow-600' : 'border border-yellow-600'}`}
            key={index}
          />
        ))}
      </View>
      
      <View className='mt-10'>
        <Pressable className='bg-yellow-500 w-80 mx-auto py-3 rounded-md'>
          <Text className='text-center text-2xl'>NEXT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}