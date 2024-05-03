import React, { useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from 'components/button';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import BackButton from '@/components/back-button';
import { Dropdown } from 'react-native-element-dropdown';
import { addToNotif, usePushNotifications } from '@/api/usePushNotification';

export default function TenantRegistration() {
  const { usertype } = useLocalSearchParams();
  const user = useAuth().session?.user;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState(null);
  const currentDate = new Date().toISOString();
  let expoPushToken = usePushNotifications(user?.id);

  const handleFirstNameChange = (text) => { setFirstName(text); };
  const handleLastNameChange = (text) => { setLastName(text); };
  const handleAddressChange = (text) => setAddress(text);
  const handleAgeChange = (num) => setAge(num);
  const handlePhoneNumberChange = (num) => setPhoneNumber(num);

  const updateUserInformation = async () => {
    try {
      await supabase.from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: user?.email,
          age: age,
          address: address,
          phone_number: phoneNumber,
          gender: gender,
          date_joined: new Date(),
        })
        .eq("id", user?.id);

      if (usertype === "Tenant") {
        await supabase.from('tenants').insert({ 'tenant_id': user?.id, 'date_joined': currentDate, 'status': 'Available'});
        router.push("/(tenant)/(tabs)/home");
      } else {
        await supabase.from('owners').insert({ 'owner_id': user?.id });
        router.push("/(owner)/(tabs)/Dashboard");
      }
    } catch (error) {
      Alert.alert("Error updating user information:", error.message);
    }
  }

  const handleSubmission = async () => {
    const fields = [firstName, lastName, address, age, phoneNumber];
    const isEmpty = fields.some(field => field.trim() === '');

    if (isEmpty) {
      Alert.alert('Please complete all fields');
      return;
    }

    try {
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          profileCompleted: 'true',
          usertype: usertype
        }
      });
      updateUserInformation();
      addToNotif(user?.id, 'Welcome to Beehauz! The ultimate boarding house portal.')
      Alert.alert("Successfully completed personal information.");
    } catch (error) {
      Alert.alert("Error updating metadata:", error.message);
    }
  }

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Do not specify', value: 'Not specified' }
  ];

  const handleGenderPress = (selectedGender) => {
    setGender(prevGender => prevGender === selectedGender ? null : selectedGender);
    
  };
  

  return (
    <SafeAreaView className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
        <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1 p-5">
          <BackButton/>
          <View className="mt-10">
            <View className="mb-5">
              <Text className="text-xl font-semibold mb-2">COMPLETE YOUR PROFILE INFORMATION</Text>
              <Text className='text-xs'>To enhance your user experience, kindly fill in the form below.</Text>
            </View>

            <View className="mt-10">
              <View className='flex-row items-center justify-between'>
                <View className='w-40'>
                  <Text className="mb-1 font-semibold">First name</Text>
                    <TextInput
                      clearTextOnFocus
                      placeholder='Ex. Juan'
                      value={firstName}
                      onChangeText={handleFirstNameChange}
                      className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
                    />
                </View>
                <View className='w-40'>
                  <Text className="mb-1 font-semibold">Last Name</Text>
                    <TextInput
                      placeholder='Ex. Dela Cruz'
                      clearTextOnFocus
                      value={lastName}
                      onChangeText={handleLastNameChange}
                      className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
                    />
                </View>
              </View>

              <View className='mt-4'>
                <Text className="mb-1 font-semibold">Email Address</Text>
                <TextInput
                    clearTextOnFocus
                    value={user?.email}
                    editable={false}
                    className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
                  />
              </View>

              <View className='mt-4'>
                <Text className="mb-1 font-semibold">Address</Text>
                  <TextInput
                    clearTextOnFocus
                    value={address}
                    placeholder={'(ex. Barangay, Municipality, Province)'}
                    onChangeText={handleAddressChange}
                    className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
                  />
              </View>

              <View className="mt-4 flex-row">
                <View className="w-28">
                  <Text className="mb-1 font-semibold">Age</Text>
                  <TextInput
                    clearTextOnFocus
                    value={age}
                    inputMode='numeric'
                    placeholder={'Age'}
                    onChangeText={handleAgeChange}
                    className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
                  />
                </View>

                <View className='grow ml-5'>
                  <Text className="mb-1 font-semibold">Gender</Text>
                  <View className='bg-gray-200 rounded-md'>
                    <Dropdown 
                      style={{padding: 4}}
                      data={genderOptions} 
                      labelField='label' 
                      valueField='value' 
                      selectedTextStyle={{fontSize: 12, left: 10}}  
                      placeholderStyle={{fontSize: 12, left: 10}}
                      placeholder={gender ? gender : 'Not specified'}
                      itemTextStyle={{fontSize: 13}}
                      itemContainerStyle={{backgroundColor: '#F3F4F6', borderColor: 'none'}}
                      onChange={item => (
                        handleGenderPress(item.value)
                      )} 
                    />
                  </View>
       
                </View>
              </View>

              <View className='mt-4'>
                  <Text className="mb-1 font-semibold">Phone Number</Text>
                  <TextInput
                    clearTextOnFocus
                    inputMode='numeric'
                    placeholder='+63 -'
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    className='p-2 pl-5 bg-gray-200 focus:border-gray-400 rounded-md text-xs'
                  />
              </View>
              
              <View className='h-20'></View>
              
            </View>
          </View>

          

        </ScrollView>

          <View className="bottom-0 p-5">
            <Button text={"CONFIRM"} onPress={handleSubmission} />
          </View>
        </>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
