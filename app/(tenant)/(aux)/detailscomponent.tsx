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


export function Amenities({propertyID}) {
    const [amenities, setAmenities] = useState([])

    const fetchAmenities = async () => {
        const {data, error} = await supabase
        .from('amenities')
        .select('*')
        .eq('property_id', propertyID)
        if (error) {
            console.log('Error message', error.message)
        } else {
        setAmenities(data)
        }
    }

    const hasFetched = useRef(false)

    useEffect(() => {
        if (!hasFetched.current) {
            fetchAmenities()
        }
    }, [propertyID])

    const Amenity = ({ item }) => {
        const renderItem = ({ item }) => (
            <View className='mr-2'>
                <View key={item.amenity_id} className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                    <Text className='text-center'>{item.amenity_name}</Text>
                </View>
            </View>
        );

    return ( <RNFlatList data={item} renderItem={renderItem} showsHorizontalScrollIndicator={false} horizontal={true} />)}

    return (
        <View>
            <View className='mt-2'>
                <Amenity item={amenities}/>
            </View>
        </View>
    )
}

export function BottomBar ({price, propertyID}) {
  const [isBooking, setIsBooking] = useState(false)
    return (
        <View className='absolute bottom-0 left-0 z-50 w-full h-16 bg-white py-2 px-6 dark:bg-gray-700 dark:border-gray-600 flex-row items-center justify-between'>

        <View>
          <Text>Rental Price</Text>
          <View className='flex-row items-center'>
            <Text className='text-4xl font-semibold mr-1'>{price}</Text>
            <Text className='text-base'>/ per month</Text>
          </View>
        </View>

        <View className='flex-row items-center gap-x-2'>
          <Pressable 
          onPress={isBooking ? () => router.push({pathname: '/VisitScreen', params: {propertyID}}) : () => router.push('/BookingDetails')}
          className=' bg-black w-32 p-3 rounded-md'>
            <Text className='text-center text-white text-base font-semibold'>{isBooking ? 'Pay a visit' : 'Book now'}</Text>
          </Pressable>

          <Pressable onPress={() => setIsBooking(!isBooking)}>
            <Ionicons name='swap-vertical-outline' size={24}/> 
          </Pressable>
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

interface OwnerData {
  name: string;
  address: string;
  email: string;
  gender: string;
  phone_number: string;
  age: string;
  created_at: string;
}

import moment from 'moment';
import AvatarImage from './avatar'

export function OwnerInformation({owner_id}) {
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);

  useEffect(() => {
    async function getOwnerData() {
      try {
        const data = await getProfile(owner_id.toString())

        if (data) {
          setOwnerData(data)
        }
      } catch (error) {
        console.log("Error fetching owner data", error.message)
      }
    }

    getOwnerData()
  }, [])

  const formatDate = (date) => {
    return moment(date).format('MMMM YYYY');
  };


  return (
    <View className='rounded-md p-5 mt-5'>
      <View className='flex-row items-center gap-x-3 justify-between'>
      
      <View className='flex-row items-center'>
        <View className='h-14 w-14 rounded-full border border-gray-300'>
          <AvatarImage username={owner_id}/>
        </View>
        <View className='ml-3'>
          <Text className='text-lg'>Owned by <Text className='font-semibold'>{ownerData?.name}</Text></Text>
          <Text className='text-gray-500'>Joined last {formatDate(ownerData?.created_at)}</Text>
          {/* still hasn't been able to implement the logic for response time */}
          <Text className='text-gray-500 text-sm'>Response time: within an hour</Text>
        </View>
      </View>

      <View className='items-center'>
        <Ionicons name='shield-checkmark-outline' size={32}/>
        <Text className='text-xs'>Verified!</Text>
      </View>
      
        
      </View>

      {/* <View className='flex-row gap-x-3 mt-3'>
        <View className='flex-row items-center border border-gray-300 p-3 justify-center rounded-lg'>
          <Ionicons name='shield-checkmark' size={20}/>
          <Text className='ml-1 text-base'>Verified</Text>
        </View>

        <View className='flex-row items-center border border-gray-300 p-3 justify-center rounded-lg'>
          <Ionicons name='star-half' size={20}/>
          <Text className='ml-1 text-base'>116 Reviews</Text>
        </View>
      </View> */}


      <View className='border border-black rounded-md overflow-hidden mt-3'>
        <Pressable 
        className='p-4 rounded-md'
        android_ripple={{color: "#ffa233"}}
        onPress={() => router.push({pathname: "/OwnerProfile", params: {owner_id : owner_id}})}>
          <Text className='text-center'>Contact Owner</Text>
        </Pressable>
      </View>
    </View>
  )
}