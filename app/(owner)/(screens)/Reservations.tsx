import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/app/components/back-button';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams } from 'expo-router';
import { getProfile } from '@/app/api/DataFetching';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';
import { sendPushNotification } from '@/app/api/usePushNotification';

export default function Reservations() {
  const params = useLocalSearchParams();
  const [activeSection, setActiveSection] = useState('Requests');
  const [profiles, setProfiles] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const formatDate = (date) => {
    return moment(date).format('MMMM DD, YYYY');
  };
  
  async function getRentalRequests() {
    try {
      setLoading(true)
      const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('property_id', params.propertyID)

      if (data) {
        const rentalData = data.reverse()
        setReservations(rentalData)
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
      console.log("Error fetching reservations: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function subscribeToChanges() {
    const channels = supabase
      .channel('tenants-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rentals' },
        (payload) => {
          console.log('Change received!', payload);
          getRentalRequests()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  async function UpdateStatus (status, tenant_id, expoPushToken) {
    const data = {
      status: status
    }

    const { data: rentalData, error} = await supabase
    .from('rentals')
    .update(data)
    .eq('tenant_id', tenant_id)

    if (error) {
      console.log("Error updating status: ", error.message)
    } else {
      if (status === 'Accept') {
        sendPushNotification(expoPushToken, 'Your reservation request has been accepted by the owner. Waiting for payment confirmation.')
      }
      
      if (status === 'Reject') {
        sendPushNotification(expoPushToken, 'Bad news! Your request has been rejected by the owner.')
      }      
    }
  }
  useEffect(() => {
    subscribeToChanges()
    getRentalRequests()
  }, [])

  const profileMap = profiles.reduce((map, profile) => {
    map[profile.id] = profile;
    return map;
}, {});

  const updatePaymentStatus = async (id) => {
    const { error } = await supabase.from('rentals')
    .update({'status': 'Payment Successful'})
    .eq("tenant_id", id)

    if (error) {
      console.log("Error updating status: ", error.message)
    }
  }


  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

        <View className='flex-row justify-evenly mt-4'>
          <Pressable onPress={() => setActiveSection('Requests')}>
            <Text
            className={`${activeSection === 'Requests' ? 'opacity-100' : 'opacity-20'}`}>Requests</Text>
          </Pressable>

          <Pressable onPress={() => setActiveSection('Transactions')}>
            <Text
            className={`${activeSection === 'Transactions' ? 'opacity-100' : 'opacity-20'}`}
            >Transactions</Text>
          </Pressable>
        </View>

        {loading ? (
          <View>
          </View>
        )  : (
          <View>
          {activeSection === 'Requests' && (
            <View className='mt-4'>
              <FlatList
              data={reservations.filter(item => item.status === 'Pending')}
              renderItem={({item, index}) => {
                const profile = profileMap[item.tenant_id];
                return (
                <View className='p-5 bg-white rounded-md'>
                  <Text className='font-medium'>Reservation Request</Text>
                  
                  <View className='mt-2'>
                    <Text>Name of Tenant: {profile?.first_name} {profile?.last_name}</Text>
                    <Text>Check-In Date: {formatDate(item?.check_in_date)}</Text>
                  </View>

                  <View className='flex-row items-center justify-center gap-x-2 mt-3'>
                    <View className='overflow-hidden rounded-md'>
                      <Pressable 
                      onPress={() => UpdateStatus('Rejected', profile?.id, profile?.expo_push_token)}
                        android_ripple={{color: "#444"}}
                        className='border border-gray-200 p-3 rounded-md w-32'>
                        <Text className='text-xs text-center'>REJECT</Text>
                      </Pressable>
                    </View>

                    <View className='overflow-hidden rounded-md'>
                      <Pressable 
                        onPress={() => UpdateStatus('Pending Payment', profile?.id, profile?.expo_push_token)}
                        className='rounded-md p-3 w-32'
                        android_ripple={{color: "white"}}
                        style={{backgroundColor: "#444"}}>
                        <Text className='text-white text-xs text-center'>ACCEPT</Text>
                      </Pressable>
                    </View>
                    
                  </View>
                  
                </View>
                )
              }}
              />
          </View>
          )}
        </View>
        )}
        
       
        {loading ? (
          <View></View>
        ) : (
          <View>
            {activeSection === 'Transactions' && (
              <View className='mt-4'>
                <FlatList
                  data={reservations.filter(item => item.status === 'Pending Payment' || item.status === 'Rejected' || item.status === 'Payment Successful')}
                  renderItem={({item, index}) => {
                    const profile = profileMap[item.tenant_id];
                    return (
                    <View>
                      {item.status === 'Pending Payment' ? (
                      <View className='p-5 bg-white rounded-md mb-4'>
                        <Text className='font-medium text-blue-600'>Waiting for Payment</Text>

                        <View className='mt-2'>
                          <Text>Name of Tenant: <Text className='font-medium'>{profile?.first_name} {profile?.last_name}</Text></Text>
                          <Text>Check-In Date: {formatDate(item?.check_in_date)}</Text>
                        </View>

                        {item.payment_method ? (
                          <View className='mt-2'>
                            <Text className='font-medium'>Payment Method: {item?.payment_method}</Text>

                            {item.payment_method === 'Cash on Hand' && (
                              <Text className='text-xs mt-1'>You can update the payment status once you received the payment.</Text>
                            )}

                            <View className='mt-2 overflow-hidden rounded-md'>
                              <Pressable 
                              onPress={() => {
                                updatePaymentStatus(profile?.id), 
                                sendPushNotification(profile?.expo_push_token, 'The owner received your payment.')}}
                              android_ripple={{color: "white"}}
                              style={{backgroundColor: "#444"}}
                              className='self-start p-2 rounded-md'>
                                <Text className='text-white'>Payment Received</Text>
                              </Pressable>
                            </View>
                          </View>
                        ) : (
                            <Text className='mt-3 text-xs'>
                                Please wait while the tenant processes the payment.
                            </Text>
                        )}
                      </View>
                    ) : item.status === 'Payment Successful' ? (
                      <View className='p-5 bg-white rounded-md mb-4'>
                        <Text className='font-medium text-green-600'>Payment Successful</Text>

                        <View className='mt-2'>
                          <Text>Name of Tenant: <Text className='font-medium'>{profile?.first_name} {profile?.last_name}</Text></Text>
                          <Text>Check-In Date: {formatDate(item?.check_in_date)}</Text>
                        </View>

                        {/* You can add any other details about the successful payment here */}
                        <Text className='mt-3 text-xs'>
                            The payment has been completed successfully. You can now add this tenant to your property.
                        </Text>
                      </View>
                    ) : (
                      <View className='p-5 bg-gray-200 rounded-md mt-4'>
                        <Text className='font-medium'>Reservation Rejected</Text>

                        <View className='mt-2'>
                          <Text>Name of Tenant: <Text className='font-medium'>{profile?.first_name} {profile?.last_name}</Text></Text>
                          <Text>Check-In Date: {formatDate(item?.check_in_date)}</Text>
                        </View>

                        <View className='mt-3'>
                          <Text className='text-sm text-red-600'>This reservation was rejected.</Text>
                        </View>
                      </View>
                    )}

                    </View>
                  )}}
                />
              </View>
            )}
          </View>
        )}
      </View>
      
    </SafeAreaView>
  )
}