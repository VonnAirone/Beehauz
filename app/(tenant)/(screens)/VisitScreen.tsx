import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import {Calendar} from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns';
import { useAuth } from '@/utils/AuthProvider'
import { supabase } from '@/utils/supabase'
import { useLocalSearchParams } from 'expo-router'

interface DataItem {
    first_name: string,
    last_name: string,
    phone_number: string
}

//WORKING ON DATABASE AND REALTIME OF VISITS
export default function PayAVisit() {
    const session = useAuth()?.session;
    const propertyID = useLocalSearchParams()
    const [user, setUser] = useState<DataItem | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('')
    const [selectedDateInWords, setSelectedDateInWords] = useState('');
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    const handleOnTimeChange = (text) => {
        setTime(text);
    }

    const getUser = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session?.user.id);
    
        if (error) {
            console.error('Error fetching user data:', error);
            return;
        }
    
        if (data && data.length > 0) {
            setUser(data[0]);
        } else {
            console.log('User not found.');
        }
    }

    
    const clearSelection = () => {
        setDate('');
        setSelectedDateInWords('');
    }

    const handleSubmission = async () => {

        if (!date || !time) {
            Alert.alert("Missing information", "Please select both time and date of your visit.")
        } else {
          const { data, error } = await supabase
          .from('appointments')
          .insert({
              tenant_id: session?.user.id,
              property_id: propertyID,
              appointment_data: date,
              appointment_time: time,
              status: 'pending',
            })
          .select() 

          if (error) {
              console.error('Error submitting visit request:', error);
          } else {
            console.log("Successfully booked a visit.")
          }
        }  
      }

    useEffect(() => {
        getUser()
    }, [])
    
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <SafeAreaView className='flex-1 p-5'>
        <BackButton/>
          <View>
            <View className='mt-3'>
              <Text className='font-semibold text-lg'>Schedule your visit</Text>
            </View>

          <View>
            <View className='flex-row gap-x-2'>
              <View className='border border-gray-300 bg-white py-2 rounded-md px-3 mt-3 grow'>
                <View className='flex-row items-center'>
                    <Ionicons name='calendar' size={15} color={"#ffa233"}/>
                    <Text className='ml-1'>Date of Visit</Text>
                </View>
                <View className='mt-2'>
                    <Text className='text-xs'>{selectedDateInWords}</Text>
                </View>
              </View>

              <View className='border border-gray-300 bg-white py-2 rounded-md px-5 mt-3 justify-center'>
                <View className='flex-row items-center'>
                    <Ionicons name='time' size={15} color={"#ffa233"}/>
                    <Text className='ml-1'>Time of Visit</Text>
                </View>
                <View>
                    <TextInput 
                    onChangeText={handleOnTimeChange}
                    className='text-xs' 
                    placeholder='Enter your preferred time'/>
                </View>
              </View>
            </View>
              <View className='mt-2'>
                <Calendar

                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#00adf5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00adf5',
                    dayTextColor: '#2d4150',}}
                    onDayPress={day => {
                      setDate(day.dateString);
                      const formattedDate = format(new Date(day.dateString), 'MMMM d, yyyy');
                      setSelectedDateInWords(formattedDate);
                  }}
                  markedDates={{
                      [date]: {selected: true, disableTouchEvent: false}
                  }}
                  className='border border-gray-300 rounded-md'
                  current={currentDate}/>
              </View>
              <View className='absolute -bottom-12 right-0 rounded-md overflow-hidden'>
                  <Pressable
                  android_ripple={{color: 'red'}} 
                  onPress={() => clearSelection()} 
                  className='border border-gray-300 p-2 rounded-md bg-white'>
                      <Text>Clear Selection</Text>
                  </Pressable>
              </View>

            </View>

          <View className='mt-5'>
            <Text className='font-semibold'>Contact Details</Text>

            <View className='gap-y-3 mt-1 mb-10'>
                <View className='flex-row items-center gap-x-2'>
                    <Ionicons name='person' size={18} color={"#ffa233"}/>
                    <Text>{user?.first_name} {user?.last_name}</Text>
                </View>
                <View className='flex-row items-center gap-x-2'>
                    <Ionicons name='call' size={18} color={"#ffa233"}/>
                    <Text>{user?.phone_number}</Text>
                </View>
                <View className='flex-row items-center gap-x-2'>
                    <Ionicons name='location' size={18} color={"#ffa233"}/>
                    <Text>Location</Text>
                </View>
            </View>      
          </View>
        </View>
        
        <View className='items-center w-full bottom-10'>
            <Pressable 
            onPress={handleSubmission}
            className='bg-yellow p-3 rounded-md w-80'>
                <Text className='text-white text-center text-base font-semibold'>Confirm your visit</Text>
            </Pressable>
        </View>
    </SafeAreaView>
  </TouchableWithoutFeedback>
  )
}
