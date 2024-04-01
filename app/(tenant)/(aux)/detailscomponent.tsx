import { Pressable, FlatList as RNFlatList, Text, View, Image, Modal } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'
import { getProfile } from '@/api/DataFetching'


//   async function insertAmenity() {
//     try {
//     const { data, error } = await supabase
//       .from('property_amenities')
//       .insert([
//           { property_id: propertyID, amenity_name: 'WiFi', availability: true, description: 'High-speed Internet' },
//           { property_id: propertyID, amenity_name: 'Common CR', availability: true, description: 'The comfort room is accessible for everyone.' }
//       ]);

//     if (error) {
//       console.error('Error:', error);
//     } else {
//       console.log('Amenity added successfully:', data);
//       alert('Amenity added successfully!');
//     }
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   }

export async function fetchAmenities(propertyID, setAmenities) {
  try {
    const {data, error} = await supabase
    .from('amenities')
    .select('*')
    .eq('property_id', propertyID)
    if (error) {
        console.log('Error message', error.message)
    } else {
    setAmenities(data)
    }
  } catch (error) {
    console.log("Error fetching amenities: ", error.message)
  }
}



export function BottomBar ({price, propertyID, propertyName}) {
  const [isBooking, setIsBooking] = useState(false)
    return (
        <View
        style={{backgroundColor: "#444"}} 
        className='absolute bottom-0 left-0 z-50 w-full h-16 py-2 px-6 flex-row items-center justify-between'>

        <View>
          <Text className='text-white'>Rental Price</Text>
          <Text className='text-base font-semibold text-white'>{price} / month</Text>
        </View>

        <View className='flex-row items-center gap-x-2'>
          <View className='overflow-hidden rounded-md'>
            <Pressable 
            onPress={() => router.push({pathname: "/VisitScreen", params: {propertyID, propertyName}})}
            android_ripple={{color: "#FDFDD9"}}
            className='border border-white p-3 rounded-md'>
              <Text className='text-white'>Pay a Visit</Text>
            </Pressable>
          </View>

          <View className='overflow-hidden rounded-md'>
            <Pressable 
            android_ripple={{color: "#ffa233"}}
            className='bg-white p-3 rounded-md'>
              <Text>Book Now</Text>
            </Pressable>
          </View>
        </View>
        
      </View>
    )
}

export function AmenitiesModal ({hideModal}) {
  return (
    <Modal 
    transparent={true}
    animationType='slide'
    className='transparent w-96 rounded-md flex-1 z-10'>
      <View className="flex-1 justify-center items-center bg-opacity-50 p-5 ">
        <View className='bg-white items-center justify-center w-full shadow-2xl shadow-black rounded-md'>

          <View className='h-40 rounded-t-md items-center justify-center bg-yellow w-full'>
            <Image source={require('assets/help-robot.png')}/>
            <View className='absolute right-3 top-3'>
              <Pressable onPress={hideModal}>
                <Ionicons name='close' size={20} color={'white'}/>
              </Pressable>
            </View>
          </View>

          <View className='p-5'>
            <View>
              <Text className='text-2xl'>What is an <Text className='font-semibold uppercase'>Amenity</Text></Text>
            </View>

            <View className='mt-2'>
              <Text className='text-base'>
              An amenity is a feature or service that enhances the comfort, convenience, or enjoyment of a particular place.
              </Text>
            </View>

            <View className='mt-8'>
              <Text className='font-semibold text-lg'>Examples of Amenities</Text>
            </View>

            <View className='flex-row flex-wrap gap-x-2 gap-y-2 mt-1'>
                <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>Wifi</Text>
                </View>

                <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>Common CR</Text>
                </View>

                
                <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>Laundry Area</Text>
                </View>

                            
                <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>Kitchen Area</Text>
                </View>

                                        
                <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>Rooms</Text>
                </View>
            </View>

            <View className='mt-10'>
              <View>
                <Text className='font-semibold text-lg'>Explore Beehauz</Text>
                <Text>
                  To discover more about the exceptional offerings at Beehauz, please visit our official website: Beehauz.com.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
