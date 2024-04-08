import { FlatList, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/back-button';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { AppointmentData, PropertyData } from '@/api/Properties';
import { fetchPropertyDetailsData } from '@/api/DataFetching';

export default function Transactions() {
  const user = useAuth()?.session.user;
  const [transactions, setTransactions] = useState<AppointmentData[] | null>(null);
  const [properties, setProperties] = useState<PropertyData[] | null>(null);

  useEffect(() => {
    getTransactions();
    subscribeToRealTimeChanges()
    
  }, []);

  async function getTransactions() {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', user.id);

      if (data) {
        setTransactions(data);
        fetchPropertyData(data);
      }

      if (error) {
        console.log("Error fetching transactions: ", error.message);
      }
    } catch (error) {
      console.log("Error fetching transactions: ", error.message);
    }
  }

  async function fetchPropertyData(transactions: AppointmentData[]) {
    if (transactions) {
      const propertyData = transactions.map(async (transaction) => {
        const property = await fetchPropertyDetailsData(transaction.property_id);
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

  async function subscribeToRealTimeChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Change received!', payload);
          getTransactions()
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }
  
  

  return (
    <SafeAreaView>
      <View className='p-5'>
        <BackButton/>

        <View className='mt-5'>
          <View>
            <Text className='font-semibold'>Transaction History</Text>
          </View>

          {/* Conditionally render FlatList only when properties are available */}
          <View className='mt-4'>
            {properties && (
              <FlatList
                data={transactions}
                renderItem={({ item, index }) => (
                  item.type === 'Visit' ? (
                    <View className='bg-gray-200 p-4 rounded-md mt-4'>
                      <Text className='mb-2'>Status: {item.status}</Text>

                      <Text className='mb-1'>You have requested a visit to {properties[index]?.name}</Text>
                      <View className='flex-row items-center gap-x-4'>
                        <Text className='text-xs'>Date of Visit: 
                        <Text className='font-semibold'> {formatDate(item.appointment_date)}</Text>
                        </Text>
                        <Text className='text-xs'>Time of Visit: 
                        <Text className='font-semibold'> {formatTime(item.appointment_time)}</Text>
                        </Text>
                      </View>
                      
                    </View>
                  ) : (
                    <View>
                      <Text>This is not a visit</Text>
                    </View>
                  )
                )}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
