import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import {Calendar} from 'react-native-calendars'

export default function BookingDetails() {
    const [selected, setSelected] = useState('');
  return (
    <SafeAreaView className='flex-1'>
        <BackButton/>
        <View className='p-5'>
            <View className='mt-3'>
                <Text className='text-2xl font-semibold'>Booking Details</Text>
            </View>
            <View>
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
                }}
                markedDates={{
                    [selected]: {selected: true, disableTouchEvent: false}
                }}
                className='border border-gray-300 rounded-md'
                current={'2012-03-01'}/>
            </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})