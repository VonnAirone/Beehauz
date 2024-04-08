import { Alert, Keyboard, Modal, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { useAuth } from '@/utils/AuthProvider'
import { supabase } from '@/utils/supabase'
import { router, useLocalSearchParams } from 'expo-router'
import { UserData } from '@/api/Properties'
import { Calendar } from 'react-native-calendars'

export default function PayAVisit() {
    const session = useAuth()?.session;
    const params = useLocalSearchParams()
    const [user, setUser] = useState<UserData | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('')
    const [selectedDateInWords, setSelectedDateInWords] = useState('');
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const [modalVisible, setModalVisible] = useState(false);
    
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
              property_id: params.propertyID,
              appointment_date: date,
              appointment_time: time,
              status: 'Pending',
              type: 'Visit'
            })
          .select() 

          if (error) {
              console.error('Error submitting visit request:', error);
          } else {
            setModalVisible(false)
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
      <View className={`${modalVisible ? 'opacity-20' : ''}`}>
        <BackButton/>
          <View>
            <View className='mt-3'>
              <Text className='font-semibold text-lg'>Schedule your visit</Text>
            </View>

          <View>
            <View className='flex-row gap-x-2'>
              <View className='border border-gray-300 bg-white py-2 rounded-md px-3 mt-3 grow'>
                <View className='flex-row items-center'>
                    <Ionicons name='calendar' size={15} color={"#444"}/>
                    <Text className='ml-1'>Date of Visit</Text>
                </View>
                <View className='mt-2'>
                    <Text className='text-xs'>{selectedDateInWords}</Text>
                </View>
              </View>

              <View className='border border-gray-300 bg-white py-2 rounded-md px-5 mt-3 justify-center'>
                <View className='flex-row items-center'>
                    <Ionicons name='time' size={15} color={"#444"}/>
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
                    todayTextColor: '#ffa233',
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
              <View className='absolute -bottom-12 z-10 right-0 rounded-md overflow-hidden'>
                  <Pressable
                  android_ripple={{color: '#ffa233'}} 
                  onPress={() => clearSelection()} 
                  className='border border-gray-300 p-2 rounded-md bg-white'>
                      <Text>Clear Selection</Text>
                  </Pressable>
              </View>

            </View>

          <View className='mt-5'>
            <Text className='font-semibold'>Contact Details</Text>

            <View className='gap-y-3 mt-1 mb-10'>
              {!user ? (
                <>
                <View className='h-3 w-32 bg-gray-200 rounded-sm'/>
                <View className='h-3 w-32 bg-gray-200 rounded-sm'/>
                <View className='h-3 w-32 bg-gray-200 rounded-sm'/>
                </>
              ) : (
                <>
                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='person' size={18} color={"#444"}/>
                  <Text>{user?.first_name} {user?.last_name}</Text>
                </View>

                <View className='flex-row items-center gap-x-2'>
                    <Ionicons name='call' size={18} color={"#444"}/>
                    <Text>{user?.phone_number}</Text>
                </View>

                <View className='flex-row items-center gap-x-2'>
                    <Ionicons name='location' size={18} color={"#444"}/>
                    <Text>{user?.address}</Text>
                </View>
              </>
              )}

               
            </View>      
          </View>
        </View>
    </View>

      <View className='items-center absolute bottom-2 self-center'>
        <View className=' rounded-md overflow-hidden'>
        <Pressable 
          style={{backgroundColor: "#444"}}
          className='bg-yellow p-3 rounded-md w-80'
          android_ripple={{color: "white"}}
          onPress={() => {
            if (!date || !time) {
              Alert.alert("Missing information", "Please select both time and date of your visit.");
            } else {
              setModalVisible(true);
            }}}>
            <Text className='text-white text-center text-base font-semibold'>Confirm your visit</Text>
            </Pressable>
        </View>
      </View>

        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>

          <View className='flex-1 justify-center items-center'>
            <View className='bg-white w-80 p-5 rounded-md justify-center border border-gray-200'>

              <Pressable
              onPress={() => setModalVisible(false)} 
              className='absolute top-2 right-3'>
                <Ionicons name='close-outline' size={20}/>
              </Pressable>

              <Text className='text-lg font-semibold'>Send Visit Request?</Text>

              <Text className='mt-3'>Appointment Details:</Text>
              <View className='gap-y-1 mt-2'>
                <Text className='opacity-60'>Property: <Text className='font-medium'>{params?.propertyName}</Text></Text>

                <Text className='opacity-60'>Date of Visit: <Text className='font-medium'>{selectedDateInWords}</Text></Text>

                <Text className='opacity-60'>Time of Visit: <Text className='font-medium'>{time}</Text></Text>
              </View>

              <View className='flex-row items-center gap-x-3 justify-evenly mt-5'>
                <View className='overflow-hidden rounded-md w-32'>
                  <Pressable 
                  onPress={() => setModalVisible(false)}
                  android_ripple={{color: '#444'}}
                  className='p-2 border border-gray-200 rounded-md'>
                    <Text className='text-center'>Cancel</Text>
                  </Pressable>
                </View>

                <View className='overflow-hidden rounded-md w-32'>
                  <Pressable 
                  style={{backgroundColor: "#444"}}
                  onPress={handleSubmission}
                  android_ripple={{color: 'white'}}
                  className='p-2 rounded-md'>
                    <Text className='text-center text-white'>Send Request</Text>
                  </Pressable>
                </View>

              </View>
              
            </View>
          </View>
        </Modal>

    </SafeAreaView>
  </TouchableWithoutFeedback>
  )
}
