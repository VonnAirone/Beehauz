import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingItem = ({ item, profile, formatDate, onApprove, onReject }) => {
  return (
    <View className='bg-gray-50 rounded-md p-5'>
      <Text>Type: {item.type}</Text>

      <View>
        <Text className='text-xl'>{profile?.first_name} {profile?.last_name}</Text>
        <Text>{profile?.address}</Text>
        <Text>{profile?.phone_number}</Text>
      </View>

      <View className='border-b-2 bg-gray-100 my-3'></View>

      <View >
        <View>
          <Text>Appointment details:</Text>
          <Text>{formatDate(item.appointment_date)}</Text>
          <Text>{item.appointment_time}</Text>
        </View>
        <Text className='mt-2'>Are you available at this time?</Text>
        <View className='flex-row items-center justify-between mt-1'>
          <View className='w-32 overflow-hidden rounded-md'>
            <Pressable
              android_ripple={{color: ""}} 
              className='flex-row items-center justify-center gap-x-1 bg-green-500 py-3 rounded-md'
              onPress={() => onApprove(item.appointment_id)}
            >
              <Ionicons name='thumbs-up-outline'/>
              <Text>Approve</Text>
            </Pressable>
          </View>
          <View className='w-32 overflow-hidden rounded-md'>
            <Pressable 
              android_ripple={{color: ""}}
              className='flex-row items-center justify-center gap-x-1 bg-red-500 py-3 rounded-md'
              onPress={() => onReject(item.appointment_id)}
            >
              <Ionicons name='thumbs-down-outline'/>
              <Text>Not available</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default BookingItem;


export const Appointments = ({ item, profile, formatDate, onApprove, onReject }) => {
  return (
    <View className='bg-gray-100 rounded-md p-5'>
    <Text>Type: {item.type}</Text>

    <View>
      <Text className='text-xl'>{profile?.first_name} {profile?.last_name}</Text>
      <Text>{profile?.address}</Text>
      <Text>{profile?.phone_number}</Text>
    </View>

    <View className='border-b-2 bg-gray-100 my-3'></View>

    <View >
      <View>
        <Text>Appointment details:</Text>
        <Text>{formatDate(item.appointment_date)}</Text>
        <Text>{item.appointment_time}</Text>
      </View>
      <Text className='mt-2'>Update Status:</Text>
      <View className='flex-row items-center justify-between mt-1'>
        <View className='w-32 overflow-hidden rounded-md'>
          <Pressable
            android_ripple={{color: ""}} 
            className='flex-row items-center justify-center gap-x-1 bg-green-500 py-3 rounded-md'
            onPress={() => onApprove(item.appointment_id)}
          >
            <Ionicons name='checkmark-outline'/>
            <Text>Complete</Text>
          </Pressable>
        </View>
        <View className='w-32 overflow-hidden rounded-md'>
          <Pressable 
            android_ripple={{color: ""}}
            className='flex-row items-center justify-center gap-x-1 bg-red-500 py-3 rounded-md'
            onPress={() => onReject(item.appointment_id)}
          >
            <Ionicons name='close-outline'/>
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </View>
  )
}


export const History = ({ item, profile, formatDate}) => {
  return (
    <View className='bg-gray-50 p-5 rounded-md mb-3'>
    <View>
      <Text className='text-xl'>{profile?.first_name} {profile?.last_name}</Text>
    </View>
    <View >
      <View>
        <Text>Appointment details:</Text>
        <Text>{formatDate(item.appointment_date)}</Text>
        <Text>{item.appointment_time}</Text>
      </View>
      <Text className='mt-2'>Status: {item.status}</Text>
    </View>
  </View>
  )
}