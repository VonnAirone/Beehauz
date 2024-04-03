import { View, Text, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Pressable, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import LottieView from 'lottie-react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { supabase } from '@/utils/supabase'
import * as Location from "expo-location"
import { router } from 'expo-router'
import { useAuth } from '@/utils/AuthProvider'

export default function PropertyCreation() {
  const user = useAuth()?.session.user;
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNameChange = (text) => setPropertyName(text);
  const handleAddressChange = (text) => setAddress(text);
  const handleDescriptionChange = (text) => setDescription(text);

  async function createProperty() {
    setLoading(true)
    try {
      const { data, error } = await supabase
      .from("property")
      .insert({
        name: propertyName,
        address: address,
        description: description,
        longitude: longitude,
        latitude: latitude,
        owner_id: user?.id,
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.log("Error creating property: ", error.message)
    } finally {
      Alert.alert("Succesfully created your property!")
      router.push("/two")
      setLoading(false)
    }
  }

  const geocode = async () => {
    const geocodedLocation = await Location.geocodeAsync(address);
    console.log("Geocoded Address:");
    console.log(geocodedLocation);

    if (geocodedLocation && geocodedLocation.length > 0) {
      const { latitude, longitude } = geocodedLocation[0];
      setLatitude(latitude)
      setLongitude(longitude)
    } else {
      console.log("No geocoded location found.");
    }
  };

  return (
    <KeyboardAvoidingView className='flex-1' behavior='height'>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className='p-5 flex-1'>
        <View>
          <BackButton/> 
        </View>

        <View className='mt-10'>
        <View className='flex-row items-center'>
          <Text className='text-lg font-semibold'>You are one step away to manage your own property.</Text>
        </View>
        <Text className='mt-2'>Please fill in the necessary informations.</Text>
      </View>


      <View className='mt-10'>
          <View className='gap-y-2'>
            <Text>Property Name:</Text>
            <TextInput
            onChangeText={handleNameChange}
            className='py-2 px-5 rounded-md bg-gray-200'/>
          </View>

          <View className='gap-y-2 mt-2'>
            <View className='flex-row items-end gap-x-1 relative'>
              <Text>Property Address</Text>
              <Pressable onPress={() => setShowModal(!showModal)}>
                <Ionicons name='help-circle-outline'/>
              </Pressable>
            </View>

            {showModal && (
            <View className='shadow-sm rounded-md bg-gray-200  absolute w-full p-3 z-10 top-5'>
              <Pressable 
              onPress={() => setShowModal(false)}
              className='absolute -top-4 right-0'>
                <Ionicons name='close'/>
              </Pressable> 
              
              <Text>To ensure the accuracy of your property address, please use the map integration feature.</Text>
            </View>
            )}

            
            <View className='flex-row gap-x-2'>
              <View className='overflow-hidden rounded-md'>
                <Pressable
                style={{backgroundColor: "#444"}}
                onPress={() => router.push("/(owner)/(screens)/MapView")}
                android_ripple={{color: "white"}} 
                className='grow items-center rounded-md justify-center w-14'>
                  <Ionicons name='location-outline' size={20} color={"white"}/>
                </Pressable>
              </View>

              
              <TextInput
              onChangeText={handleAddressChange}
              className='py-2 px-5 rounded-md bg-gray-200 grow'/>
            </View>
          </View>

          <View className='gap-y-2 mt-2'>
            <View className='flex-row items-center'>
              <Text>Description:</Text>
              <Text className='ml-1 text-xs text-gray-600'></Text>
            </View>
            
            <TextInput
            onChangeText={handleDescriptionChange}
            placeholder='Tell us about your property.'
            multiline
            className='py-2 px-5 rounded-md bg-gray-200'/>
          </View>
      </View>
        
        <View className='overflow-hidden rounded-md mt-10'>
          <Pressable
          style={{backgroundColor: "#444"}}
          onPress={createProperty}
          android_ripple={{color: '#fdffd9'}} 
          className='p-4 flex-row items-center justify-center gap-x-1 bg-yellow rounded-md'>
            <Text className='text-white'>{loading ? "LOADING" : "CREATE PROPERTY"}</Text>
            <Ionicons name='create-outline' size={15} color={"white"}/>
          </Pressable>
        </View>



        </SafeAreaView>
      </TouchableWithoutFeedback> 
    </KeyboardAvoidingView>
   
  )
}
