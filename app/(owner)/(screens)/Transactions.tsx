import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/back-button';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { AppointmentData, PropertyData, UserData } from '@/api/Properties';
import { fetchPropertyDetailsData, getProfile } from '@/api/DataFetching';
import { router, useLocalSearchParams } from 'expo-router';
import LoadingComponent from '@/components/LoadingComponent';

export default function Transactions() {
  const user = useAuth()?.session.user;
  const params = useLocalSearchParams()
  const [transactions, setTransactions] = useState([]);
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<UserData[] | null>(null)

  useEffect(() => {
    fetchTransactions()
    // fetchProfiles(transactions)
    subscribeToVisitChanges()
    subscribeToRentalChanges()
  }, []);

  
  async function fetchTransactions() {
    try {
      setLoading(true)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('property_id', params.property);

      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .eq('property_id', params.property);
    
      if (transactionsError) {
        console.log("Error fetching transactions: ", transactionsError.message);
      }
      if (rentalsError) {
        console.log("Error fetching rentals: ", rentalsError.message);
      }
  
      if (transactionsData && rentalsData) {
        const combinedData = [
            ...transactionsData.map(entry => ({ ...entry, type: 'Visit' })),
            ...rentalsData.map(entry => ({ ...entry, type: 'Rental' }))
        ];

        combinedData.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          
          return dateB.getTime() - dateA.getTime();  
      });
      setTransactions(combinedData);

      const tenantData = combinedData.map(async (transaction) => {
        
        const profile = await getProfile(transaction.tenant_id.toString());
        return profile;
      });

      const resolvedProfiles = await Promise.all(tenantData);
      setProfiles(resolvedProfiles);

    }
    } catch (error) {
      console.log("Error fetching data: ", error.message);
    } finally {
      setLoading(false)
    }
  }
  

  // async function fetchProfiles(transactions: AppointmentData[]) {
  //   if (transactions) {
  //     console.log(transactions)
  //     const tenantData = transactions.map(async (transaction) => {
        
  //       const profile = await getProfile(transaction.tenant_id.toString());
  //       return profile;
  //     });

  //     const resolvedProfiles = await Promise.all(tenantData);
  //     setProfiles(resolvedProfiles);
  //   }
  // }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    const formattedHours = String(Number(hours)).padStart(2, '0');
    const formattedMinutes = String(Number(minutes)).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  }

  async function subscribeToVisitChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          fetchTransactions()
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }
  
  async function subscribeToRentalChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rentals' },
        (payload) => {
          fetchTransactions()
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }
  

  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

        <ScrollView 
        showsVerticalScrollIndicator={false}
        className='mt-5'>
          <View>
            <Text className='font-semibold'>Transaction History</Text>
          </View>

        {loading ?
          (
          <View className='h-full'>
            <LoadingComponent/>
          </View>
          ) : (
            <View>
            {transactions && (
              <FlatList
                scrollEnabled={false}
                data={transactions}
                keyExtractor={item => item.appointment_id || item.rental_id}
                renderItem={({ item, index }) => {
                  const tenantName = profiles && profiles[index] ? [profiles[index].first_name ,' ', profiles[index].last_name ] : 'Unknown User';
                
                  if (item.type === 'Visit') {
                    if (item.status === 'Approved') {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
  
                          <Text className='font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
                          
                          <Text className='mb-1'>You have approved <Text className='font-medium'>{tenantName}</Text>'s request to visit your property on {formatDate(item.appointment_date)} at {formatTime(item.appointment_time)}.</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Please review and respond to the request.
                          </Text>
                        </View>
                      );
                    } else if (item.status === 'Rejected') {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold text-red-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'>You have rejected <Text className='font-medium'>{tenantName}</Text>'s request to visit your property.</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Consider informing the tenant about the reasons for the rejection to maintain clear communication.
                          </Text>
                        </View>
                      );
                    } else if (item.status === 'Finished') {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'><Text className='font-medium'>{tenantName}</Text>'s visit to your property was finished.</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Please follow up if necessary and update the appointment status accordingly.
                          </Text>
                        </View>
                      );
                    } else {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'><Text className='font-medium'>{tenantName}</Text> has requested a visit to your property.</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Please review and respond to the request.
                          </Text>
                        </View>
                      );
                    }
                  } else if (item.type === 'Rental') {
                    if (item.status === 'Rejected') {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold text-red-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'>A reservation request from <Text className='font-medium'>{tenantName}</Text> for your property is pending approval.</Text>
                          <Text className='mt-2 text-xs'>
                            Please consider making a different request or contacting the property owner for more information.
                          </Text>
                        </View>
                      );
                    } else if (item.status === 'Pending Payment') {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='mb-1'>You have approved the reservation request of <Text className='font-medium'>{tenantName}</Text>.</Text>
                          <Text className='mt-2 text-xs'>
                            Awaiting payment completion before the deadline.
                          </Text>
                        </View>
                      );
                    } else if (item.status === 'Payment Successful') {
                      return (
                        <Pressable className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='mb-1'><Text className='font-medium'>{tenantName}</Text> has completed the payment for their reservation on your property.</Text>
                          <Text className='mt-2 text-xs'>
                            You can now prepare the room for their stay.
                          </Text>
                        </Pressable>
                      );
                    } else {
                      return (
                        <View className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold'>Status: {item.status}</Text>
                          <Text className='mb-1'>A reservation request from <Text className='font-medium'>{tenantName}</Text> for your property. The check in date is on {item?.check_in_date}</Text>
                          <Text className='mt-2 text-xs'>
                            Please review the details and confirm or decline the reservation.
                          </Text>
                        </View>
                      );
                    }
                  } else {
                    return (
                      <View className='bg-gray-200 p-4 rounded-md mt-4'>
                        <Text>Status not recognized</Text>
                      </View>
                    );
                  }
                }}/>
              )}
          </View>
          )}
          
          <View className='h-20'/>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
