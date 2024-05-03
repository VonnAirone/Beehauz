import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/back-button';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { AppointmentData, PropertyData } from '@/api/Properties';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { router } from 'expo-router';
import LoadingComponent from '@/components/LoadingComponent';
import { usePushNotifications } from '@/api/usePushNotification';

export default function Transactions() {
  const user = useAuth()?.session.user;
  const [transactions, setTransactions] = useState([]);
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    subscribeToVisitChanges()
    subscribeToRentalChanges()
  }, []);

  async function fetchData() {
    try {
      setLoading(true)
      await fetchTransactions()
    } catch (error) {
      console.log("Error fetching transactions: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function cancelVisit(status) {
    try {
      const {data, error} = await supabase
      .from('appointments')
      .update({status: status})
      .eq('tenant_id', user?.id)
    } catch (error) {
      
    }
  }
  
  async function fetchTransactions() {
    try {
      setLoading(true)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', user.id.toString());

      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .eq('tenant_id', user.id.toString());
    
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
      fetchPropertyData(combinedData)
      setTransactions(combinedData);
    }
    } catch (error) {
      console.log("Error fetching data: ", error.message);
    } finally {
      setLoading(false)
    }
  }
  

  async function fetchPropertyData(transactions: AppointmentData[]) {
    if (transactions) {
      const propertyData = transactions.map(async (transaction) => {
        
        const property = await fetchPropertyDetailsData(transaction.property_id.toString());
        return property;
      });

      const resolvedProperties = await Promise.all(propertyData);
      setProperties(resolvedProperties);
    }
  }

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
      .channel('realtime-appointment-channel')
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
          // console.log('Change received!', payload);
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
            {transactions && transactions.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={transactions}
                keyExtractor={item => item.appointment_id || item.rental_id}
                renderItem={({ item, index }) => {
                  const propertyName = properties && properties[index] ? properties[index].name : 'Unknown Property';
                
                  if (item.type === 'Visit') {
                    // Handling 'Visit' appointments
                    if (item.status === 'Approved') {
                      return (
                        <View key={index} className='bg-gray-200 p-4 rounded-md mt-4'>
  
                          <Text className='font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
                          
                          <Text className='mb-1'>You have an approved visit to {propertyName}</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Your visit has been approved! Please be punctual and follow all property rules during your visit.
                          </Text>
                        </View>
                      );
                    } else if (item.status === 'Rejected') {
                      return (
                        <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold text-red-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'>Your request to visit {propertyName} was denied.</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Please consider requesting another visit at a different time or reach out to the property owner for more information.
                          </Text>
                        </View>
                      );
                    } else {
                      return (
                        <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'>You have requested a visit to {propertyName}</Text>
                          <View className='flex-row items-center gap-x-4'>
                            <Text className='text-xs'>
                              Date of Visit: <Text className='font-semibold'>{formatDate(item.appointment_date)}</Text>
                            </Text>
                            <Text className='text-xs'>
                              Time of Visit: <Text className='font-semibold'>{formatTime(item.appointment_time)}</Text>
                            </Text>
                          </View>
                          <Text className='mt-2 text-xs'>
                            Please wait for the owner to confirm your visit.
                          </Text>
                        </View>
                      );
                    }
                  } else if (item.type === 'Rental') {
                    if (item.status === 'Rejected') {
                      return (
                        <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='font-semibold text-red-700'>Status: {item.status}</Text>
                          <Text className='text-xs mb-4'>Requested last {formatDate(item.created_at)}</Text>
  
                          <Text className='mb-1'>Your rental request at {propertyName} was denied.</Text>
                          <Text className='mt-2 text-xs'>
                            Please consider making a different request or contacting the property owner for more information.
                          </Text>
                        </View>
                      );
                    } else if (item.status === 'Approved') {
                      return (
                        <Pressable key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='mb-1'>Your rental request at {propertyName} has been approved!</Text>
                          <Text className='mt-2 text-xs'>
                            Please follow the agreed-upon terms and enjoy your stay.
                          </Text>
                        </Pressable>
                      );
                    } else if (item.status === 'Pending Payment') {
                      if (item.payment_method === 'Cash on Hand') {
                        return (
                          <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                            <Text className='mb-2 font-semibold text-green-700'>Status: {item.status}</Text>
                            <Text className='mb-1'>Your rental request at {propertyName} has been approved!</Text>
                            <Text className='mt-2 text-xs'>
                              You've chosen <Text className='font-medium'>Cash on Hand</Text> as your payment method. The owner will update the payment status once they have received the payment.
                            </Text>
  
  
                          </View>
                        )
                      } else {
                      return (
                        <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='mb-1'>Your rental request at {propertyName} has been approved!</Text>
                          <Text className='mt-2 text-xs'>
                            Proceed to payment to complete your booking.
                          </Text>
  
                          <View className='rounded-md overflow-hidden'>
                            <Pressable 
                            onPress={() =>
                              router.push({pathname: "/(tenant)/(payment)/paymentIntent", params: {rentalID: item.rental_id, propertyID: item.property_id}})
                            }
                            android_ripple={{color: "white"}}
                            style={{backgroundColor: "#444"}}
                            className='p-2 self-start rounded-md my-2'>
                              <Text className='text-white'>Proceed to Payment</Text>
                            </Pressable>
                          </View>
                          
                        </View>
                      );
                    }
                    } else if (item.status === 'Payment Successful') {
                      return (
                        <Pressable key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold text-green-700'>Status: {item.status}</Text>
                          <Text className='mb-1'>Congratulations! You have paid your reservation in {propertyName}</Text>
                          <Text className='mt-2 text-xs'>
                            The owner will add you to the property in a while. Please follow the agreed-upon terms and enjoy your stay.
                          </Text>
                        </Pressable>
                      );
                    } else {
                      return (
                        <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                          <Text className='mb-2 font-semibold'>Status: {item.status}</Text>
                          <Text className='mb-1'>Your rental request at {propertyName} is being processed.</Text>
                          <Text className='mt-2 text-xs'>
                            Please wait for further updates from the property owner.
                          </Text>
                        </View>
                      );
                    }
                  } else {
                    // Fallback rendering if data type is not recognized
                    return (
                      <View key={index}  className='bg-gray-200 p-4 rounded-md mt-4'>
                        <Text>Status not recognized</Text>
                      </View>
                    );
                  }
                }}/>
              ) : (
                <View className='flex-1 justify-center items-center mt-80'>
                  <Text>No transactions as of the moment.</Text>
                </View>
              )}
          </View>
          )}
          
          <View className='h-20'/>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
