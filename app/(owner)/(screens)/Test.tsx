import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams } from 'expo-router';
import { getProfile } from '@/api/DataFetching';
import BookingItem, { Appointments, History } from '../(aux)/bookingcomponents';
import BackButton from '@/components/back-button';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingSkeleton } from '../(aux)/SkeletonComponents';

export default function Bookings() {
  const [bookings, setBookings] = useState(null);
  const [bookingProfile, setBookingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const [reloadData, setReloadData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
  };


  useEffect(() => {
    fetchBookings();
    const unsubscribe = subscribeToRealTimeChanges();
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, [reloadData]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq("property_id", params.property_id)

      if (error) {
        console.error('Error fetching bookings:', error.message);
        return;
      }

      setBookings(data);
      fetchProfiles(data);
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
    } 
  };

  async function subscribeToRealTimeChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Change received!', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }

  async function fetchProfiles(bookingData) {
    if (bookingData) {
      const profilesPromises = bookingData.map(async (tenant) => {
        const profile = await getProfile(tenant.tenant_id);
        return profile;
      });
      const profilesData = await Promise.all(profilesPromises);
      setBookingProfile(profilesData);
      setLoading(false)
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

  async function updateAppointmentStatus(status, appointment_id) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: status })
        .eq('appointment_id', appointment_id);
  
      if (error) {
        console.log("Error updating appointment status: ", error.message);
      } else {
        console.log("Successfully updated appointment status.");
        setReloadData(prev => !prev); 
      }
  
      console.log(appointment_id);
    } catch (error) {
      console.log("Error updating appointment status: ", error.message);
    }
  }
  

  return (
    <SafeAreaView className='flex-1 bg-white'
    >
      <ScrollView 
      showsVerticalScrollIndicator={false}
      className='p-5'>
        <BackButton/>

        {loading ? (
          <BookingSkeleton/>
        ) : (
        <>
          <View className='mt-2'>
            <Text className='font-semibold'>Requests ({bookings?.filter(item => item.status === 'Pending')?.length})</Text>
          </View>

        <View>
          {bookings && bookings?.filter(item => item.status === 'Pending').length === 0 ? (
            <View className='h-60 items-center justify-center'>
              <Text>No pending requests</Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={bookings?.filter(item => item.status === 'Pending')}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <BookingItem 
                  item={item} 
                  profile={bookingProfile[index]} 
                  formatDate={formatDate} 
                  onApprove={(appointment_id) => updateAppointmentStatus('Approved', appointment_id)}
                  onReject={(appointment_id) => updateAppointmentStatus('Rejected', appointment_id)}
                />
              )}
            />
          )}
        </View>
      </>
      )}



      <View className='mt-8 border-2 border-gray-200'></View>

      {loading ? (
        <BookingSkeleton/>
      ) : (
        <>
          <View className='mt-2 flex-row justify-between items-center'>
            <Text className='font-semibold'>Appointments ({bookings?.filter(item => item.status === 'Approved')?.length})</Text>
          </View>
          <View className='mt-4'>
            {bookings && bookings?.filter(item => item.status === 'Approved').length === 0 ? (
                <View className='h-60 items-center justify-center'>
                  <Text>No appointments</Text>
                </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={bookings?.filter(item => item.status === 'Approved')}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <Appointments 
                    item={item} 
                    profile={bookingProfile[index]} 
                    formatDate={formatDate} 
                    onApprove={(appointment_id) => updateAppointmentStatus('Finished', appointment_id)}
                    onReject={(appointment_id) => updateAppointmentStatus('Cancelled', appointment_id)}
                  />
                )}
              />
            )}
          </View>
        </>
      )}

      <View className='mt-8 border-2 border-gray-200'></View>

      <View className='mt-2 flex-row justify-between items-center'>
          <Text className='font-semibold'>History ({bookings?.filter(item => ['Finished', 'Rejected', 'Cancelled'].includes(item.status)).length})</Text>
      </View>
      {loading ? (
        <BookingSkeleton/>
      ) : (
        <View className='mt-4'>
          {bookings && bookings?.filter(item => ['Finished', 'Rejected', 'Cancelled'].includes(item.status)).length === 0 ? (
            <View className='h-60 items-center justify-center'>
              <Text>No History</Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={bookings?.filter(item => ['Finished', 'Rejected', 'Cancelled'].includes(item.status))}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <History 
                  item={item} 
                  profile={bookingProfile[index]} 
                  formatDate={formatDate} 
                />
              )}
            />
          )}
        </View>
      )}
      <View className='h-40'>

      </View>    
    </ScrollView>
  </SafeAreaView>
  )
}
