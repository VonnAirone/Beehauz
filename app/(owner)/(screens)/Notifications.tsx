import { Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfile } from '@/app/api/DataFetching';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';
import moment from 'moment';
import BackButton from '@/app/components/back-button';
import { FlatList } from 'react-native-gesture-handler';
import { convertTo12HourFormat } from '@/app/components/convertToTimeFormat';

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [profiles, setProfiles] = useState([])
  const params = useLocalSearchParams()

  const formatDate = (date) => {
    return moment(date).format('MMMM DD, YYYY');
  };

  async function subscribeToBookingChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq("property_id", params.propertyID)

      if (error) {
        console.error('Error fetching bookings:', error.message);
        return;
      }

      if (data) {
        setBookings(data)
        const ids = data.map(async (data) => {
        return data.tenant_id
        }) 

        const tenantIDs = await Promise.all(ids);

        if (tenantIDs) {
          const profilesPromises = tenantIDs.map(async (tenant_id) => {
            const profile = await getProfile(tenant_id);
            return profile;
          });
          const profilesData = await Promise.all(profilesPromises);
          setProfiles(profilesData)
          
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
    } 
  };

  useEffect(() => {
    fetchBookings()
    subscribeToBookingChanges()
  })


  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>
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

        <FlatList
        data={bookings}
        renderItem={({ item, index }) => {
        switch (item.status) {
            case 'Pending':
                return (
                    <View key={index} className='overflow-hidden rounded-md mt-4'>
                        <Pressable
                            android_ripple={{ color: "#444" }}
                            className='bg-white p-5 rounded-md'
                        >
                            <View className='bg-gray-400 rounded-md self-start items-center p-2'>
                                <Text>Visit Request</Text>
                            </View>
                            <Text className='mt-2'>You have a new visit request! <Text className='font-medium'>{profiles[index]?.first_name} </Text>would like to visit on <Text className='font-medium'>{formatDate(item?.appointment_date)} at <Text>{convertTo12HourFormat(item?.appointment_time)}</Text></Text>.</Text>
                            <Text className='text-xs mt-2'>Check the details for more information and to accept or reject the request.</Text>
                        </Pressable>
                    </View>
                );

            case 'Approved':
                return (
                    <View key={index}  className='overflow-hidden rounded-md mt-4'>
                        <Pressable
                            android_ripple={{ color: "#444" }}
                            className='bg-white p-5 rounded-md'
                        >
                            <Text className='text-green-600'>Approved Request!</Text>
                            <Text className='mt-2'>The visit with <Text className='font-medium'>{profiles[index]?.first_name}</Text> on <Text className='font-medium'>{formatDate(item?.appointment_date)}</Text> at <Text>{convertTo12HourFormat(item?.appointment_time)}</Text> has been approved.</Text>
                        </Pressable>
                    </View>
                );

            case 'Finished':
                return (
                    <View key={index} className='overflow-hidden rounded-md mt-4'>
                        <Pressable
                            android_ripple={{ color: "#444" }}
                            className='p-5 rounded-md bg-white'
                        >
      
                            <Text className='text-blue-600'>Finished Request</Text>
                            <Text className='mt-2'>The visit with <Text className='font-medium'>{profiles[index]?.first_name}</Text> on <Text className='font-medium'>{formatDate(item?.appointment_date)}</Text> at <Text>{convertTo12HourFormat(item?.appointment_time)}</Text> has been completed.</Text>
                        </Pressable>
                    </View>
                );

            case 'Reject':
                return (
                    <View key={index} className='overflow-hidden rounded-md mt-4'>
                        <Pressable
                            android_ripple={{ color: "#444" }}
                            className='bg-red-200 p-5 rounded-md'
                        >
                            <Text className='text-red-600'>Request Rejected!</Text>
                            <Text className='mt-2'>The visit with <Text className='font-medium'>{profiles[index]?.first_name}</Text> on <Text className='font-medium'>{formatDate(item?.appointment_date)}</Text> at <Text>{convertTo12HourFormat(item?.appointment_time)}</Text> has been rejected.</Text>
                        </Pressable>
                    </View>
                );

            default:
                // Handle other cases or display a default view if needed
                return null;
              }
            }}
          />


      </View>
    </SafeAreaView>
  )
}