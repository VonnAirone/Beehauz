import { View, Text, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/utils/AuthProvider'
import { UserData } from '@/api/Properties'
import { getProfile } from '@/api/DataFetching'
import { uploadAvatar } from '@/api/ImageFetching'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'

export default function ManageProfile() {
  const user = useAuth()?.session?.user;
  const [allowEdit, setAllowEdit] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatar, setAvatar] = useState(null);
  const [reloadData, setReloadData] = useState(false);
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      async function fetchData() {
        await fetchUserData();
        await fetchAvatar();
      }
  
      fetchData();
      hasFetched.current = true;
    }
  }, []); 

  async function fetchUserData() {
    try {
      setLoading(true)
      const data = await getProfile(user?.id)
      if (data) {
        setUserData(data)
      }
    } catch (error) {
      console.log("Error fetching user information: ", error.message)
    }
  }

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

  const fetchAvatar = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.storage.from('images').list(`avatars/${user?.id}`);
      if (data && data.length > 0) {
        const lastAvatar = data[data.length - 1];
        const avatarURL = await downloadAvatar(user?.id, lastAvatar.name);
        setAvatar(avatarURL);
      } else {
        console.log('No avatar found');
      }
    } catch (error) {
      console.error('Error loading avatar:', error.message);
    } finally {
      setLoading(false)
    }
  };

  const downloadAvatar = async (userID, itemName) => {
    try {
      const { data } = await supabase.storage
        .from('images')
        .download(`avatars/${userID}/${itemName}`);
      
      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setAvatar(fr.result);
        };
      } else {
        console.log('No data for avatar');
        return null;
      }
    } catch (error) {
      console.error('Error downloading avatar:', error.message);
      return null;
    }
  };

  async function changeProfile() {
    await uploadAvatar(user?.id);
    setAvatar(null);
    fetchAvatar();
  }

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='p-5' showsVerticalScrollIndicator={false}>
          <View>
            <Pressable onPress={() => router.back()}>
              <View className='flex-row items-center '>
                  <Ionicons name='chevron-back-outline' size={20}/>
                  <Text>Back</Text>
              </View>
            </Pressable>
        </View>
        <View className='items-center bg-yellow rounded-md mt-2 h-32 mb-6'>
            <View className='absolute -bottom-10 rounded-full border-2 border-yellow bg-white overflow-hidden'>
              <Pressable 
              onPress={changeProfile}
              android_ripple={{color: "#ffa233"}}>
                {loading ? (
                  <View className='h-28 w-28 justify-center items-center'>
                    {/* <ActivityIndicator size={'large'}/> */}
                  </View>
                  
                ) : (
                  <View className='opacity-40 h-28 w-28'> 
                    {avatar && 
                    <Image source={{ uri: avatar }} style={{ width: 100, height: 100 }} 
                    />} 
                  </View>
               )}
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