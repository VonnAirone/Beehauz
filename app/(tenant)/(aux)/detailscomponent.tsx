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
              <Text>Reserve Now</Text>
            </Pressable>
          </View>
        </View>
        
      </View>
    )
}
