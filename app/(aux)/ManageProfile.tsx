import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/utils/AuthProvider'
import { UserData } from '@/api/Properties'
import { getProfile } from '@/api/DataFetching'
import AvatarImage from '../(tenant)/(aux)/avatar'
import { uploadAvatar } from '@/api/ImageFetching'
import { supabase } from '@/utils/supabase'

export default function ManageProfile() {
  const user = useAuth()?.session?.user;
  const [allowEdit, setAllowEdit] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchUserData () {
      try {
        const data = await getProfile(user?.id)

        if (data) {
          setUserData(data)
        }
      } catch (error) {
        console.log("Error fetching user information: ", error.message)
      }
    }

    fetchUserData()
  }, [user])

  const handleChangeText = (key, value) => {
    setUserData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };

  async function updateProfile() {

    const data = {
      first_name: userData?.first_name,
      last_name: userData?.last_name,
      description: userData?.description,
      phone_number: userData?.phone_number,
      address: userData?.address
    }

    try {
      setLoading(true)

      const { data: userData, error: errorData } = await supabase
      .from("profiles")
      .update(data)
      .eq('id', user?.id)

      if (errorData) {
        console.log("Error updating user information: ", errorData.message)
      } else {
        Alert.alert("Successfully updated profile!")
      }   
    } catch (error) {
      console.log("Error updating user information: ", error.message)
    } finally {
      setLoading(false)
    }
  }


  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='p-5' showsVerticalScrollIndicator={false}>
        <BackButton/>

        <View className='items-center bg-yellow rounded-md mt-2 h-32 mb-6'>
            <View className='absolute -bottom-10 rounded-full border-2 border-yellow bg-white overflow-hidden'>
              <Pressable 
              onPress={() => uploadAvatar(user?.id)}
              android_ripple={{color: "#ffa233"}}>
                <View className='opacity-20 h-28 w-28'>
                    <AvatarImage userID={user?.id}/>
                  </View>
                  <View className='absolute self-center top-10'>
                    <Ionicons name='camera' color={'#ffa233'} size={32}/>
                  </View>
              </Pressable>
            </View>
          </View>

        <View className='flex-row items-center justify-between mt-4'>
          <Text className='font-semibold text-xl'>Manage Profile</Text>
          <Pressable onPress={() => setAllowEdit(!allowEdit)}>
            <Ionicons name='create-outline' size={20}/>
          </Pressable>
        </View>

        <View className='flex-row items-center gap-x-4'>
          <View className='gap-y-2 mt-2 w-40'>
              <Text className='font-semibold'>First Name</Text>
              <TextInput 
              onChangeText={(text) => handleChangeText('first_name', text)}
              className='w-full border border-gray-200 rounded-md py-2 px-5'
              editable={allowEdit}
              value={userData?.first_name}/>
          </View>

          <View className='gap-y-2 mt-2 w-40'>
            <Text className='font-semibold'>Last Name</Text>
            <TextInput 
            onChangeText={(text) => handleChangeText('last_name', text)}
            className='w-full border border-gray-200 rounded-md py-2 px-5'
            editable={allowEdit}
            value={userData?.last_name}/>
          </View>
        </View>

        
        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Description</Text>
          <TextInput className='w-full border border-gray-200 rounded-md py-2 px-5'
          onChangeText={(text) => handleChangeText('description', text)} 
          editable={allowEdit}
          multiline
          value={userData?.description}
          placeholder='Tell us about yourself'/>
        </View>

        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Email</Text>
          <TextInput className='w-full border border-gray-200 rounded-md py-2 px-5'
          editable={false}
          value={userData?.email}/>
        </View>
        
        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Phone Number</Text>
          <TextInput className='w-full border border-gray-200 rounded-md py-2 px-5'
          onChangeText={(text) => handleChangeText('phone_number', text)} 
          editable={allowEdit}
          value={userData?.phone_number.toString()}/>
        </View>

        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Address</Text>

          <View className='flex-row items-center gap-x-2'>
            <View className='p-3 rounded-md bg-yellow'>
              <Ionicons name='location' color={"white"} size={20}/>
            </View>
            
            <TextInput className='grow border border-gray-200 rounded-md py-2 px-5'
            onChangeText={(text) => handleChangeText('address', text)} 
            value={userData?.address}/>
          </View>
        </View>

          {allowEdit && (
            <View className='pt-8'>
              <Pressable 
              onPress={updateProfile}
              className='bg-yellow rounded-md p-3'>
                <Text className='text-center text-white'>{loading ? 'Loading' : 'Save Changes'}</Text>
              </Pressable>
            </View>
          )}


      </ScrollView>
    </SafeAreaView>
  )
}