
import { Alert, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Glass from 'components/glassmorph'
import InputField from 'components/input-field'
import Button from 'components/button'
import Logo from 'components/logo'
import { router } from 'expo-router'

export default function TenantRegistration({email}) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isEmpty, setIsEmpty] = useState(false)

  const handleNameChange = (text) =>{ setName(text); setIsEmpty(false);}
  const handleAddressChange =  (text) => setAddress(text);

  // NOTE: REMOVED THE EMAIL DUE TO UNDEFINED ERROR
  const handleSubmission = async () => {
    const fields = [name, address];
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
      router.replace("/(tabs)/one");
    }
  }
  
  return (
      <SafeAreaView className='flex-1'>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView className='container flex-1 top-36 items-center'>
            <>
              <View className='w-80 mx-auto items-start'>
                <Logo />
              </View>
              
              <View className='mb-5 w-80'>
                <Glass>
                  <Text className='text-2xl font-semibold'>COMPLETE YOUR PROFILE INFORMATION</Text>
                  <Text>Please complete your profile for the best user experience.</Text>
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


              </View>
                <View className='mt-10'>
                <Button text={"CONFIRM"} onPress={handleSubmission} />
              </View>
            </>
          
         </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({})