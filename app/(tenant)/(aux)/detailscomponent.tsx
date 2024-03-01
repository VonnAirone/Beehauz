import { Pressable, FlatList as RNFlatList, Text, View, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/utils/supabase'

export function Reviews() {
  return (
    <View> 
        <View className='flex-row items-center gap-x-1'>  
          <Ionicons name='star-outline' size={15} color={'#FF8B00'}/>
          <Text className='text-base'>4.5k reviews</Text>
        </View>

    </View>
  )
}

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


export function Amenities({propertyID}) {
    const [amenities, setAmenities] = useState([])

    const fetchAmenities = async () => {
        const {data, error} = await supabase
        .from('property_amenities')
        .select('*')
        .eq('property_id', propertyID)
        if (error) {
            console.log('Error message', error.message)
        }
        setAmenities(data)
    }

    const hasFetched = useRef(false)

    useEffect(() => {
        if (!hasFetched.current) {
            fetchAmenities()
        }
    }, [propertyID])

    const Amenity = ({ item }) => {
        const renderItem = ({ item }) => (
            <View className='mr-3'>
                <View key={item.amenity_id} className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>{item.amenity_name}</Text>
                </View>
            </View>
        );

    return ( <RNFlatList  data={item} renderItem={renderItem}showsHorizontalScrollIndicator={false} horizontal={true} />)}

    return (
        <View>
            <View>
                <Text className='text-xl font-semibold'>Amenities</Text>
            </View>

            <View className='mt-2'>
                <Amenity item={amenities}/>
            </View>
            

        </View>
    )
}

export function BottomBar ({price}) {
    return (
        <View className='absolute bottom-0 left-0 z-50 w-full h-16 bg-white py-2 px-6 dark:bg-gray-700 dark:border-gray-600 flex-row items-center justify-between'>

        <View>
          <Text>Rental Price</Text>
          <View className='flex-row items-center'>
            <Text className='text-4xl font-semibold mr-1'>{price}</Text>
            <Text className='text-base'>/ per month</Text>
          </View>
        </View>

        <View>
          <Pressable className=' bg-black w-40 p-3 rounded-md'>
            <Text className='text-center text-white text-base font-semibold'>Book now</Text>
          </Pressable>
        </View>
      </View>
    )
}

export function AmenitiesModal ({hideModal}) {
  return (
    <View className='bg-white w-96 rounded-md'>

      <View className='absolute right-3 top-3 z-10'>
        <Pressable onPress={hideModal}>
          <Ionicons name='close' size={20} color={'white'}/>
        </Pressable>
      </View>

      <View className='bg-yellow w-full h-40 rounded-t-md items-center justify-center'>
        <Image source={require('assets/help-robot.png')}/>
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
  )
}