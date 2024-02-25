
import { Alert, Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Glass from 'components/glassmorph'
import InputField from 'components/input-field'
import Button from 'components/button'
import Logo from 'components/logo'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/utils/supabase'

export default function TenantRegistration({email}) {
  let { usertype } = useLocalSearchParams()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [age, setAge] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isEmpty, setIsEmpty] = useState(false)

  const handleNameChange = (text) =>{ setName(text); setIsEmpty(false);}
  const handleAddressChange =  (text) => setAddress(text);
  const handleAgeChange = (num) => setAge(num);
  const handlePhoneNumberChange = (num) => setPhoneNumber(num);

  // NOTE: REMOVED THE EMAIL DUE TO UNDEFINED ERROR
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
      // Check if the user is authenticated before navigating
      const user = supabase.auth.getUser();
      console.log(user)
  
      if (user) {
        // User is authenticated, navigate to tenant page
        router.replace("/(tenant)/(tabs)/home");
      } else {
        // User is not authenticated, you may want to handle this case (e.g., show an alert)
        Alert.alert('Authentication Error', 'Please log in first.');
      }
    }
  }
  
  
  return (
    <KeyboardAvoidingView className='flex-1 justify-center items-center'>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        
            <>
              <View className='absolute top-10'>
                <Logo/>
              </View>

              <Pressable 
              onPress={() => router.back()}
              className='flex-row absolute top-5 left-10 items-center'>
                <Ionicons name='chevron-back-outline' size={20}/>
                <Text className='text-lg ml-1'>Back</Text>
              </Pressable>
              
              <View className='mb-5 w-80'>
                <Glass>
                  <Text className='text-2xl font-semibold text-center mb-2'>COMPLETE YOUR PROFILE INFORMATION</Text>
                  <Text className='text-center'>Please complete your profile for the best user experience.</Text>
                </Glass>
              </View>
              <View className='flex gap-y-4'>
                <View>
                  <InputField 
                  value={name} 
                  onChangeText={handleNameChange} 
                  placeholder={'Name: (ex. Juan De La Cruz)'} 
                  isPassword={false} 
                  isNumeric={""} 
                  isEditable={true}/>
                </View>

              <View>
                <InputField 
                 value={address}
                 onChangeText={handleAddressChange} 
                 placeholder={'Address (ex. Barangay, Municipality, Province)'} isPassword={false} 
                 isNumeric={""} 
                 isEditable={true}/>
              </View>

              <View>
                <InputField 
                value={email} 
                onChangeText={email} 
                placeholder={"Email"} 
                isPassword={false} 
                isNumeric={""} 
                isEditable={false}/>
              </View>

              <View>
                <InputField 
                value={age} 
                onChangeText={handleAgeChange} 
                placeholder={"Age"} 
                isPassword={false} 
                isNumeric={"numeric"} 
                isEditable={true}/>
              </View>

              <View>
                <InputField 
                value={phoneNumber} 
                onChangeText={handlePhoneNumberChange} 
                placeholder={"Phone number"} 
                isPassword={false} 
                isNumeric={"numeric"} 
                isEditable={true}/>
              </View>

              </View>
                <View className='mt-10'>
                <Button text={"CONFIRM"} onPress={handleSubmission} />
              </View>
            </>
         </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    
    );
}

const styles = StyleSheet.create({})