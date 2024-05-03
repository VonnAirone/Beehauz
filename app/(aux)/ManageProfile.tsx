import { View, Text, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/utils/AuthProvider'
import { UserData } from '@/api/Properties'
import { getProfile } from '@/api/DataFetching'
import { uploadAvatar } from '@/api/ImageFetching'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'
import { Dropdown } from 'react-native-element-dropdown'

export default function ManageProfile() {
  const user = useAuth()?.session?.user;
  const [allowEdit, setAllowEdit] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState(null);
  const [gender, setGender] = useState(null);

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Do not specify', value: 'Not specified' }
  ];


  const handleGenderPress = (selectedGender) => {
    setGender(selectedGender);
    handleChangeText('gender', selectedGender);
  };
  

  useEffect(() => {
    // if (!hasFetched.current) {
      async function fetchData() {
        await fetchUserData();
        await fetchAvatar();
      }
  
      fetchData();
    //   hasFetched.current = true;
    // }
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
      address: userData?.address,
      gender: userData?.gender,
      age: userData?.age,
      updated_at: new Date(Date.now()).toUTCString()
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
    if (avatar) {
      await updateProfile();
      setAvatar(null);
      fetchAvatar();
    } else {
      console.log("No avatar uploaded.");
    }
  }
  
  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='p-5' showsVerticalScrollIndicator={false}>

        {allowEdit && (
          <View 
          className='bg-white z-10 border border-gray-200 self-center p-2 rounded-md absolute'>
            <Text className=''>On Edit Mode</Text>
          </View>
        )}

          <View>
            <Pressable onPress={() => router.back()}>
              <View className='flex-row items-center '>
                  <Ionicons name='chevron-back-outline' size={20}/>
                  <Text>Back</Text>
              </View>
            </Pressable>
        </View>
        <View 
        style={{backgroundColor: "#444"}}
        className='items-center rounded-md mt-2 h-32 mb-6'>
            <View className='absolute -bottom-10 rounded-full border-2 border-gray-200 bg-white overflow-hidden'>
              <Pressable 
              onPress={allowEdit ? changeProfile : () => {}}
              android_ripple={{color: "#444"}}>
                {loading ? (
                  <View className={`h-28 w-28 justify-center items-center ${allowEdit ? 'opacity-60' : ''}`}>
                    {/* <ActivityIndicator size={'large'}/> */}
                  </View>
                  
                ) : (
                  <View className={`h-28 w-28 ${allowEdit && 'opacity-20'}`}> 
                    {avatar ?
                    (
                    <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} 
                    />
                    ) :(
                    <Image source={require("@/assets/icon.png")} style={{ width: "100%", height: "100%" }} 
                    />
                    )} 
                  </View>
               )}
                  <View className='absolute self-center top-10'>
                    {allowEdit && (
                      <Ionicons name='camera' color={'#444'} size={32}/>
                    )}
                   
                  </View>
              </Pressable>
            </View>
          </View>

        <View className='flex-row items-center justify-between mt-4'>
          <Text className='font-semibold text-xl'>Manage Profile</Text>
          <Pressable 
          className='flex-row items-center gap-x-1'
          onPress={() => setAllowEdit(!allowEdit)}>
            <Text>Edit</Text>
            <Ionicons name='pencil' size={15}/>
            
          </Pressable>
        </View>

        <View className='flex-row items-center gap-x-4'>
          <View className='gap-y-2 mt-2 w-40'>
              <Text className='font-semibold'>First Name</Text>
              <TextInput 
              onChangeText={(text) => handleChangeText('first_name', text)}
              className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
              editable={allowEdit}
              value={userData?.first_name}/>
          </View>

          <View className='gap-y-2 mt-2 w-40'>
            <Text className='font-semibold'>Last Name</Text>
            <TextInput 
            onChangeText={(text) => handleChangeText('last_name', text)}
            className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
            editable={allowEdit}
            value={userData?.last_name}/>
          </View>
        </View>

        
        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Description</Text>
          <TextInput className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
          onChangeText={(text) => handleChangeText('description', text)} 
          editable={allowEdit}
          multiline
          value={userData?.description}
          placeholder='Tell us about yourself'/>
        </View>

        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Email</Text>
          <TextInput className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
          editable={false}
          value={user?.email}/>
        </View>

        <View className="mt-4 flex-row">
          <View className="w-28">
            <Text className="mb-1 font-semibold">Age</Text>
            <TextInput
              inputMode='numeric'
              editable={allowEdit}
              clearTextOnFocus
              value={userData?.age?.toString()}
              onChangeText={(text) => handleChangeText('age', text)}
              className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
            />
          </View>

          <View className='grow ml-5'>
            <Text className="mb-1 font-semibold">Gender</Text>
            <View className='bg-gray-200 rounded-md'>
            <Dropdown

              disable={true}
              style={{padding: 4}}
              data={genderOptions} 
              labelField='label' 
              valueField='value' 
              selectedTextStyle={{fontSize: 12, left: 10}}  
              placeholderStyle={{fontSize: 12, left: 10}}
              value={gender}
              placeholder={userData?.gender}
              itemTextStyle={{fontSize: 13}}
              itemContainerStyle={{backgroundColor: '#F3F4F6', borderColor: 'none'}}
              onChange={item => (
                handleGenderPress(item.value)
              )} 
            />
            </View>
  
          </View>
        </View>
        
        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Phone Number</Text>
          <TextInput 
          inputMode='numeric'
          className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
          onChangeText={(text) => handleChangeText('phone_number', text)} 
          maxLength={11}
          editable={allowEdit}
          value={userData?.phone_number?.toString()}/>
        </View>

        <View className='gap-y-2 mt-2'>
          <Text className='font-semibold'>Address</Text>
            
          <TextInput 
          editable={allowEdit}
          className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs grow'
          onChangeText={(text) => handleChangeText('address', text)} 
          value={userData?.address}/>
        </View>


        {/* <View className='pt-10'>
          <Pressable 
          android_ripple={{color: "white"}}
          style={{backgroundColor: "#444"}}
          onPress={updateProfile}
          className='rounded-md p-3'>
            <Text className='text-center text-white'>{loading ? 'Loading' : 'Save Changes'}</Text>
          </Pressable>
        </View> */}

        

          {allowEdit && (
            <View className='pt-8'>
              <Pressable 
              style={{backgroundColor: "#444"}}
              onPress={updateProfile}
              className='rounded-md p-3'>
                <Text className='text-center font-medium text-white'>{loading ? 'Loading' : 'SAVE CHANGES'}</Text>
              </Pressable>
            </View>
          )}

          <View className='h-10'></View>
      </ScrollView>
    </SafeAreaView>
  )
}