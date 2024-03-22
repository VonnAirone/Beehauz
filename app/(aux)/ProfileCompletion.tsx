import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glass from 'components/glassmorph';
import InputField from 'components/input-field';
import Button from 'components/button';
import Logo from 'components/logo';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import * as Location from "expo-location"

export default function TenantRegistration({ email }) {
  const { usertype } = useLocalSearchParams();
  const user = useAuth().session?.user;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  const handleFirstNameChange = (text) => { setFirstName(text); setIsEmpty(false); };
  const handleLastNameChange = (text) => { setLastName(text); setIsEmpty(false); };
  const handleAddressChange = (text) => setAddress(text);
  const handleAgeChange = (num) => setAge(num);
  const handlePhoneNumberChange = (num) => setPhoneNumber(num);

  // useEffect(() => {
  //   async function getUserLocation() {
  //     let { status } = await Location.getForegroundPermissionsAsync()
  //     if (stats !== "granted") {
  //      console.log("Permission to access location was denied")
  //      return;
  //    }
  //     let location = await Location.getCurrentPositionAsync({});
  //     setLocation(location)
  //   }
  //    
  //    getUserLocation()
  //   
  //    
  // })
  const updateUserInformation = async () => {
     let {data, error} = await supabase.from('profiles')
     .update({
      first_name: firstName,
      last_name: lastName, 
      email: user?.email,
      age: age,
      address: address,
      phone_number: phoneNumber
    })
    .eq("id", user?.id)

      if (error) {
        Alert.alert("Error updating user information:", error.message)
      } else {
        if (usertype === "Tenant") {
          router.push("/(tenant)/(tabs)/home")
        } else {
          router.push("/(owner)/(tabs)/one")
        }
      }
  }
  
  const handleSubmission = async () => {
    const fields = [firstName, lastName, address, age, phoneNumber];
    let isEmpty = false;

    for (const field of fields) {
      if (field.trim() === '') {
        isEmpty = true;
        setIsEmpty(true);
        Alert.alert('Please complete all fields');
        break;
      }
    }

    if (isEmpty) {
      return;
    } else {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata, 
          profileCompleted: 'true',
          usertype: usertype }
      })

      if (error) {
        Alert.alert("Error updating metadata:", error.message)
      } else {
        Alert.alert("Successfully completed personal information.")
        updateUserInformation()
      }
    }
  }

//  WORK ON THE KEYBOARD AVOIDING VIEW
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <Pressable
              onPress={() => router.back()}
              className="flex-row ml-5 mt-5"
            >
              <Ionicons name='chevron-back-outline' size={20} />
              <Text className="text-lg ml-1">Back</Text>
            </Pressable>

            <View className="items-center">
              <Logo />
            </View>

            <View className="items-center mt-5">
              <View className="mb-5 w-80 mx-auto">
                <Glass>
                  <Text className="text-2xl font-semibold text-center mb-2">COMPLETE YOUR PROFILE INFORMATION</Text>
                  <Text className="text-center">Please complete your profile for the best user experience.</Text>
                </Glass>
              </View>

              <View className="flex gap-y-4 w-80">
                <View className='flex-row items-center justify-between'>
                  <View>
                    <Text className="mb-1">First name</Text>
                      <TextInput
                        clearTextOnFocus
                        value={firstName}
                        onChangeText={handleFirstNameChange}
                        className='p-2 pl-5 w-36 border-gray-300 focus:border-gray-400 border rounded-md text-sm'
                      />
                  </View>
                  <View>
                    <Text className="mb-1">Last Name</Text>
                      <TextInput
                        clearTextOnFocus
                        value={lastName}
                        onChangeText={handleLastNameChange}
                        className='p-2 pl-5 w-36 border-gray-300 focus:border-gray-400 border rounded-md text-sm'
                      />
                  </View>
                  
                </View>

                <View>
                  <Text className="mb-1">Email Address</Text>
                  <TextInput
                      clearTextOnFocus
                      value={user?.email}
                      editable={false}
                      className='p-2 pl-5 border-gray-300 focus:border-gray-400 border rounded-md text-sm'
                    />
                </View>

                <View>
                  <Text className="mb-1">Address</Text>
                    <TextInput
                      clearTextOnFocus
                      value={address}
                      placeholder={'(ex. Barangay, Municipality, Province)'}
                      onChangeText={handleAddressChange}
                      className='p-2 pl-5 border-gray-300 focus:border-gray-400 border rounded-md text-sm'
                    />
                </View>

                <View className="flex-row justify-between">
                  <View className="w-28">
                    <Text className="mb-1">Age</Text>
                    <TextInput
                      clearTextOnFocus
                      value={age}
                      placeholder={'Age'}
                      onChangeText={handleAgeChange}
                      className='p-2 pl-5 border-gray-300 focus:border-gray-400 border rounded-md text-sm'
                    />
                  </View>

                  <View className="w-48">
                    <Text className="mb-1">Phone Number</Text>
                    <TextInput
                      clearTextOnFocus
                      value={phoneNumber}
                      placeholder={'+63'}
                      onChangeText={handlePhoneNumberChange}
                      className='p-2 pl-5 border-gray-300 focus:border-gray-400 border rounded-md text-sm'
                    />
                  </View>
                </View>
              </View>

              <View className="mt-10">
                <Button text={"CONFIRM"} onPress={handleSubmission} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
