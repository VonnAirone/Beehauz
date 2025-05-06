  import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams } from 'expo-router';
import { getProfile } from '@/app/api/DataFetching';
import BookingItem, { Appointments, History } from '../(aux)/bookingcomponents';
import BackButton from '@/app/components/back-button';
import { addToNotif, sendPushNotification } from '@/app/api/usePushNotification';

  export default function Bookings() {
    const [bookings, setBookings] = useState(null);
    const [bookingProfile, setBookingProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = useLocalSearchParams();
    const [reloadData, setReloadData] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeSection, setActiveSection] = useState('Requests');

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
          const profilesDict = {};  // Create a dictionary to map tenant_id to profile data
          const profilesPromises = bookingData.map(async (booking) => {
              const profile = await getProfile(booking.tenant_id);
              profilesDict[booking.tenant_id] = profile;  // Map the profile to tenant_id
          });
          await Promise.all(profilesPromises);
          setBookingProfile(profilesDict);  // Set the bookingProfile state to the dictionary
          setLoading(false);
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

          <View className='flex-row justify-evenly mt-4'>
            <Pressable onPress={() => setActiveSection('Requests')}>
              <Text
              className={`${activeSection === 'Requests' && 'border-b-2'} pb-2`}>Requests</Text>
            </Pressable>

            <Pressable onPress={() => setActiveSection('Appointments')}>
              <Text
              className={`${activeSection === 'Appointments' && 'border-b-2'} pb-2`}
              >Appointments</Text>
            </Pressable>

            <Pressable onPress={() => setActiveSection('History')}>
              <Text
              className={`${activeSection === 'History' && 'border-b-2'} pb-2`}>History</Text>
            </Pressable>
          </View>

          {loading ? (
            <View/>    
          ) : (
          <>
          {activeSection === 'Requests' && (
            <View className='mt-4'>
              {bookings && bookings?.filter(item => item.status === 'Pending').length === 0 ? (
                <View className='h-60 items-center justify-center'>
                  <Text>No pending requests</Text>
                </View>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={bookings?.filter(item => item.status === 'Pending')}
                  keyExtractor={(item, index) => item.toString()}
                  renderItem={({ item }) => {
                    const profile = bookingProfile[item.tenant_id];
                    return (
                        <BookingItem 
                            item={item} 
                            profile={profile}
                            formatDate={formatDate} 
                            onApprove={(appointment_id) => {
                              updateAppointmentStatus('Approved', appointment_id)
                              addToNotif(profile?.id, 'Your request to visit the property has been approved.')
                              sendPushNotification(profile?.expo_push_token, 'Your request to visit the property has been approved.')
                            }}

                            onReject={(appointment_id) => {
                              updateAppointmentStatus('Rejected', appointment_id)
                              addToNotif(profile?.id, 'Your request to visit the property has been rejected.')
                              sendPushNotification(profile?.expo_push_token, 'Your request to visit the property has been rejected.')
                            }}
                        />
                    );
                }}
                />
              )}
            </View>
          )}

          {activeSection === 'Appointments' && (
            <>
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
                  renderItem={({ item }) => {
                    const profile = bookingProfile[item.tenant_id];
                    return (
                    <Appointments 
                      item={item} 
                      profile={profile} 
                      formatDate={formatDate} 
                      onApprove={(appointment_id) => {
                        updateAppointmentStatus('Finished', appointment_id)
                        addToNotif(profile?.id, 'You have successfully finished your appointment.')
                        sendPushNotification(profile?.expo_push_token, 'You have successfully finished your appointment.')
                      }}
                      onReject={(appointment_id) => {
                        updateAppointmentStatus('Cancelled', appointment_id)
                        addToNotif(profile?.id, 'The owner has cancelled your visit. For more details, contact the property owner.')
                        sendPushNotification(profile?.expo_push_token, 'The owner has cancelled your visit. For more details, contact the property owner.')
                      }}
                    />
                    )
                  }}
                />
              )}
            </View>
          </>
          )}

          {activeSection === 'History' && (
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
                  renderItem={({ item }) => {
                    const profile = bookingProfile[item.tenant_id];
                    return (
                    <History 
                      item={item} 
                      profile={profile} 
                      formatDate={formatDate} 
                    />
                    )
                  }}
                />
              )}
            </View>
          )}

        </>
        )}   
      </ScrollView>
    </SafeAreaView>
    )
  }
