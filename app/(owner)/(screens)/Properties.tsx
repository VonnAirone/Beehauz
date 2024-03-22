import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { useAuth } from '@/utils/AuthProvider'

import { Ionicons } from '@expo/vector-icons'
import { SingleImageDisplay } from '@/app/(tenant)/(aux)/homecomponents'
import { getProperties } from '@/api/DataFetching'
import LottieView from 'lottie-react-native'
import { PropertyData } from '@/api/Properties'

export default function Properties() {
  const user = useAuth()?.session.user.id;
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [loading, setLoading] = useState(true)
  


  useEffect(() => {
    getProperties(user, setLoading, setProperties);
  }, []) 


  return (
    <SafeAreaView>
      <View>
        <BackButton/>
      </View>

      <View className='px-10 py-5'>
            <View className='h-10 w-10'>
              <LottieView
              autoPlay
              loop
              style={{width: "100%", height: "100%"}}
              source={require("@/assets/home.json")}/>
            </View>
        <Text className='text-xl'>Your Properties</Text>
      </View>
      {loading ? (
        <FlatList
        data={properties}
        renderItem={({item}) => (
          <View className='px-10'>
            <View className='bg-gray-100 h-48 rounded-md'/>
            <View className='flex-row items-center justify-between'>
              <View className='h-4 w-32 bg-gray-100 mt-2 rounded-md'/>
              <View className='h-5 w-20 bg-gray-100 mt-2 rounded-md'/>
            </View>
            <View className='h-3 w-40 bg-gray-100 mt-2 rounded-md'/>
          </View>
        )}/>
      ) : (
        <FlatList 
        data={properties} 
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className='px-10'>
              <View>
                <View className='border border-gray-300 h-48 rounded-md'>
                  <SingleImageDisplay propertyID={item.property_id}/>
                </View>
                <View className='mt-2 flex-row justify-between'>
                  <Text className='text-2xl'>{item.name}</Text>
                  <Text className='text-xl text-yellow'>{item.price}</Text>
                </View>
  
                <View className="flex-row items-center">
                  <Ionicons name="location" color={'#FFA233'}/>
                  <Text className="text-yellow">{item.address}</Text>
                </View>

                <View className='flex-row justify-between gap-x-4 mt-4'>
                  <View className='grow w-32'>
                    <Pressable className='flex-row grow items-center justify-center gap-x-1 border border-yellow py-3 px-2 rounded-md'>
                      <Ionicons name='eye-outline'/>
                      <Text className='text-xs'>View as User</Text>
                    </Pressable>
                  </View>
                  <View className='grow w-32'>
                    <Pressable className='flex-row items-center justify-center gap-x-1 bg-yellow py-3 px-2 rounded-md'>
                      <Ionicons name='hammer-outline'/>
                      <Text className='text-xs'>Manage Property</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
        )}/>
      )}
     

     

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})