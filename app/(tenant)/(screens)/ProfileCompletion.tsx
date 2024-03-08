import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glass from 'components/glassmorph';
import InputField from 'components/input-field';
import Button from 'components/button';
import Logo from 'components/logo';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';

export default function TenantRegistration({ email }) {
  const { usertype } = useLocalSearchParams();
  const user = useAuth().session?.user;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  const handleNameChange = (text) => { setName(text); setIsEmpty(false); };
  const handleAddressChange = (text) => setAddress(text);
  const handleAgeChange = (num) => setAge(num);
  const handlePhoneNumberChange = (num) => setPhoneNumber(num);

  const handleSubmission = async () => {
    const fields = [name, address, age, phoneNumber];
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
        data: { ...user.user_metadata, profileCompleted: 'true' }
      })

      if (error) {
        Alert.alert("Error updating metadata:", error.message)
      } else {
        if (usertype === "Tenant") {
          router.push("/(tenant)/(tabs)/home")
        } else {
          router.push("/(owner)/(tabs)/one")
        }
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
                <View>
                  <Text className="mb-1">Name</Text>
                  <InputField
                    value={name}
                    onChangeText={handleNameChange}
                    placeholder={'Name: (ex. Juan De La Cruz)'}
                    isPassword={false}
                    isNumeric={""}
                    isEditable={true}
                  />
                </View>

                <View>
                  <Text className="mb-1">Email Address</Text>
                  <InputField
                    value={user?.email}
                    onChangeText={email}
                    placeholder={user?.email}
                    isPassword={false}
                    isNumeric={""}
                    isEditable={false}
                  />
                </View>

                <View>
                  <Text className="mb-1">Address</Text>
                  <InputField
                    value={address}
                    onChangeText={handleAddressChange}
                    placeholder={'(ex. Barangay, Municipality, Province)'}
                    isPassword={false}
                    isNumeric={""}
                    isEditable={true}
                  />
                </View>

                <View className="flex-row justify-between">
                  <View className="w-28">
                    <Text className="mb-1">Age</Text>
                    <InputField
                      value={age}
                      onChangeText={handleAgeChange}
                      placeholder={"Age"}
                      isPassword={false}
                      isNumeric={"numeric"}
                      isEditable={true}
                    />
                  </View>

                  <View className="w-48">
                    <Text className="mb-1">Phone Number</Text>
                    <InputField
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                      placeholder={"+63"}
                      isPassword={false}
                      isNumeric={"numeric"}
                      isEditable={true}
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
