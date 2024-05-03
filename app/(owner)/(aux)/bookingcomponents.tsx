import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';


function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const formattedHours = String(Number(hours)).padStart(2, '0');
  const formattedMinutes = String(Number(minutes)).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

const BookingItem = ({ item, profile, formatDate, onApprove, onReject }) => {
  return (
    <View className='p-5 bg-gray-50 rounded-md '>
      <View className='flex-row items-start justify-between'>
        <View className='mt-2'>
          <Text>Tenant Details: </Text>
          <Text className='text-xl font-medium mt-2'>{profile?.first_name} {profile?.last_name}</Text>
          <Text className='text-xs'>{profile?.address}</  Text>
          <Text className='text-xs'>{profile?.phone_number}</Text>
        </View>
      </View>

      <View className='bg-gray-50 mt-4 p-3'>
        <View>
          <Text className='font-semibold'>Appointment details:</Text>
          <Text>{formatDate(item.appointment_date)}</Text>
          <Text>{formatTime(item.appointment_time)}</Text>
        </View>
        <Text className='mt-4 text-center'>Are you available at this time?</Text>
        <View className='flex-row items-center justify-between mt-2'>
          <View className='w-32 overflow-hidden rounded-md'>
            <Pressable
              android_ripple={{color: ""}} 
              className='flex-row items-center justify-center border border-gray-200 py-3 rounded-md'
              onPress={() => onReject(item.appointment_id)}
            >
              <Ionicons name='thumbs-down-outline'/>
              <Text className='ml-1'>Unavailable</Text>
            </Pressable>
          </View>
          <View className='w-32 overflow-hidden rounded-md'>
            <Pressable 
              style={{backgroundColor: "#444"}}
              android_ripple={{color: ""}}
              className='flex-row items-center justify-center py-3 rounded-md'
              onPress={() => onApprove(item.appointment_id)}
            >
              <Ionicons name='thumbs-up-outline' color={'white'}/>
              <Text className='ml-1 text-white'>Approve</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default BookingItem;


export const Appointments = ({ item, profile, formatDate, onApprove, onReject }) => {
  const time = item.appointment_time
  const formattedTime = convertTo12HourFormat(time)

  function convertTo12HourFormat(timeString) {
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    
    // Determine if the time is AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert the 24-hour hour value to a 12-hour format
    let hour12 = hours % 12;
    
    // Handle the case where hour12 is zero (12 AM/PM)
    if (hour12 === 0) {
        hour12 = 12;
    }

    
    // Format the time into a string with 12-hour format and AM/PM
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return (
    <View className='bg-gray-50 rounded-md p-5'>

    <View className='flex-row items-start justify-between'>
      <View className='mt-2'>
        <Text>Tenant Details: </Text>
        <Text className='text-xl font-medium mt-2'>{profile?.first_name} {profile?.last_name}</Text>
        <Text className='text-xs'>{profile?.address}</Text>
        <Text className='text-xs'>{profile?.phone_number}</Text>
      </View>

      <View className='bg-gray-200 rounded-md w-24 items-center p-1'>
        <Text>{item.type} Request</Text>
      </View>
    </View>

    <View className='bg-gray-50 mt-4 p-3'>
      <View>
        <Text className='font-semibold'>Appointment details:</Text>
        <Text>{formatDate(item.appointment_date)}</Text>
        <Text>{formattedTime}</Text>
      </View>
      <Text className='mt-4 text-center'>Update appointment status:</Text>
      <View className='overflow-hidden rounded-md mt-2'>
        <Pressable 
          style={{backgroundColor: "#444"}}
          android_ripple={{color: ""}}
          className='flex-row items-center justify-center py-3 rounded-md'
          onPress={() => onApprove(item.appointment_id)}
        >
          <Ionicons name='checkmark-outline' color={'white'}/>
          <Text className='ml-1 text-white'>Completed</Text>
        </Pressable>
      </View>
    </View>
  </View>
  )
}


export const History = ({ item, profile, formatDate}) => {
  
  const time = item.appointment_time
  const formattedTime = convertTo12HourFormat(time)

  function convertTo12HourFormat(timeString) {
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    
    // Determine if the time is AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert the 24-hour hour value to a 12-hour format
    let hour12 = hours % 12;
    
    // Handle the case where hour12 is zero (12 AM/PM)
    if (hour12 === 0) {
        hour12 = 12;
    }

    
    // Format the time into a string with 12-hour format and AM/PM
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return (
    <View className='bg-gray-50 p-5 rounded-md mb-3 flex-row items-start justify-between'>
      <View>
        <Text className='font-semibold'>{profile?.first_name} {profile?.last_name}</Text>
        <Text className='mt-2'>Appointment details:</Text>
        <View className='mt-2'>
          <Text className='text-xs'>Date of Visit: 
            <Text className='font-medium'> {formatDate(item.appointment_date)}</Text>
          </Text>
          <Text className='text-xs'>Time of Visit
            <Text className='font-medium'> {formattedTime}</Text>
          </Text>
        </View>
        
      </View>

      <View className='items-end'>
        <View 
        className={`rounded-md w-24 items-center p-1
        ${item.status === 'Rejected' && ('bg-gray-200')}
        ${item.status === 'Finished' && ('bg-green-200')}
        `}>
          <Text>{item.status}</Text>
        </View>

        {/* <Pressable 
        onPress={() => router.push({pathname: "/(owner)/(screens)/TenantProfile", params: {tenant_id : profile?.id}})}
        className='flex-row items-center top-10'>
          <Text className='text-xs mr-1'>View Tenant Profile</Text>
          <Ionicons name='chevron-forward'/>
        </Pressable> */}
      </View>
     
    </View>
  )
}