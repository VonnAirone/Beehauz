import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import {Calendar} from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns';
import { useAuth } from '@/utils/AuthProvider'
import { supabase } from '@/utils/supabase'

interface DataItem {
    first_name: string,
    last_name: string,
    phone_number: string
}

export default function PayAVisit() {
    const session = useAuth()?.session;
    const [user, setUser] = useState<DataItem | null>(null);
    const [selected, setSelected] = useState('');
    const [selectedDateInWords, setSelectedDateInWords] = useState('');

    const getUser = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session?.user.id);
    
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

    useEffect(() => {
        getUser()
    }, [])
    
  return (
    <SafeAreaView className='flex-1'>
        <BackButton/>
            <View className='p-5'>
                <View className='mt-3'>
                    <Text className='text-2xl font-semibold'>Schedule your visit</Text>
                </View>

                <View className='mt-3'>
                    <View className='flex-row gap-x-2'>
                        <View className='border border-gray-300 bg-white py-2 rounded-md px-5 mt-3  flex-row items-center w-stretch'>
                            <View className='mr-2'>
                                <Ionicons name='calendar-outline' size={28}/>
                            </View>
                            <View>
                                <Text>Date of Visit</Text>
                                <Text>{selectedDateInWords}</Text>
                            </View>
                        </View>

                        <View className='border border-gray-300 bg-white py-2 rounded-md px-5 mt-3  flex-row items-center flex-grow'>
                            <View className='mr-2'>
                                <Ionicons name='time-outline' size={28}/>
                            </View>
                            <View>
                                <Text>Time of Visit</Text>
                                <TextInput placeholder='12:))'/>
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
                                    setSelected(day.dateString);
                                    const formattedDate = format(new Date(day.dateString), 'EEEE, MMMM d, yyyy');
                                    setSelectedDateInWords(formattedDate);
                            }}
                            markedDates={{
                                [selected]: {selected: true, disableTouchEvent: false}
                            }}
                            className='border border-gray-300 rounded-md'
                            current={'2012-03-01'}/>
                    </View>
                </View>

                <View className='mt-5'>
                    <Text className='text-xl font-semibold'>Contact Details</Text>

                    <View className='gap-y-3 mt-2 mb-10'>
                        <View className='flex-row items-center gap-x-2 opacity-60'>
                            <Ionicons name='person-outline' size={18}/>
                            <Text className='text-base'>{user?.first_name} {user?.last_name}</Text>
                        </View>
                        <View className='flex-row items-center gap-x-2 opacity-60'>
                            <Ionicons name='call-outline' size={18}/>
                            <Text className='text-base'>{user?.phone_number}</Text>
                        </View>
                        <View className='flex-row items-center gap-x-2 opacity-60'>
                            <Ionicons name='location-outline' size={18}/>
                            <Text className='text-base'>Location of the user</Text>
                        </View>
                    </View>      
                </View>

        </View>
        
        <View className='absolute bottom-5 items-center w-full'>
            <Pressable className='bg-black p-4 rounded-md w-80'>
                <Text className='text-white text-center text-base font-semibold'>Confirm your visit</Text>
            </Pressable>
        </View>
    </SafeAreaView>
  )
}
