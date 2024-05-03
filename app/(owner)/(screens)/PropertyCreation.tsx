import { View, Text, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Pressable, Alert, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { supabase } from '@/utils/supabase'
import * as Location from "expo-location"
import { router } from 'expo-router'
import { useAuth } from '@/utils/AuthProvider'
import { LocationData } from '@/api/Properties'
import MapView, { Marker } from 'react-native-maps'
import LoadingComponent from '@/components/LoadingComponent'

export default function PropertyCreation() {
  const user = useAuth()?.session.user;
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [showModal, setShowModal] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null);

  const [markerPosition, setMarkerPosition] = useState<{ latitude: number, longitude: number } | null>(null);

  const handleNameChange = (text) => setPropertyName(text);
  const handleAddressChange = (text) => setAddress(text);
  const handleDescriptionChange = (text) => setDescription(text);

  useEffect(() => {
    fetchData()
  }, [])


  async function fetchData() {
    try {
      setLoading(true)
      await fetchUserLocation()
    } catch (error) {
      console.log("Error fetching user location: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserLocation () {
    let { coords } = await Location.getCurrentPositionAsync({});
    setLocation(coords);
    setMarkerPosition(coords);
  }

  const handleMarkerDrag = (e) => {
    setMarkerPosition(e.nativeEvent.coordinate);
    setLatitude(markerPosition.latitude)
    setLongitude(markerPosition.longitude)
  };

  const validateFields = () => {
    if (!propertyName || !address || !description) {
      Alert.alert("Please fill in all the fields", "Ensure that all fields are provided.");
      return false;
    }
    return true;
  };

  async function createProperty() {
    if (!validateFields()) return;

    setLoading(true);
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
      
      if (error) throw new Error(error.message);
      Alert.alert("Property Created", "Successfully created your property!");
      router.push("/two");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  const reverseGeocode = async () => {
      const reverseGeocodedAddress  = await Location.reverseGeocodeAsync({
        latitude: latitude,
        longitude: longitude
      })
      if (reverseGeocodedAddress && reverseGeocodedAddress.length > 0) {
        const fullAddress = reverseGeocodedAddress[0].formattedAddress;
        console.log(fullAddress)
        const commaIndex = fullAddress.indexOf(',');

        if (commaIndex !== -1) {
            const trimmedAddress = fullAddress.substring(commaIndex + 1).trim();
            console.log(trimmedAddress)
            setAddress(trimmedAddress);
        } else {
            setAddress(fullAddress);
        }
    } else {
        console.error("No address found from reverse geocoding");
    }
      setMapVisible(false)
  }

  return (
    <KeyboardAvoidingView className='flex-1' behavior='height'>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {loading ? (
          <View>
            <LoadingComponent/>
          </View>
        ) : (
          <>
          <SafeAreaView className='flex-1 p-5'>
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
                  className='py-2 px-5 rounded-md bg-gray-50'/>
                </View>

                <View className='gap-y-2 mt-2'>
                  <View className='flex-row items-end gap-x-1 relative'>
                    <Text>Property Address</Text>
                    <Pressable onPress={() => setShowModal(!showModal)}>
                      <Ionicons name='help-circle-outline' size={15}/>
                    </Pressable>
                  </View>

                  {showModal && (
                  <Pressable 
                  onPress={() => setShowModal(false)}
                  className='shadow-sm rounded-md bg-gray-50 border border-gray-300  absolute w-full p-3 z-10 top-5'>
                    <Text>To ensure the accuracy of your property address, please use the map integration feature.</Text>
                  </Pressable>
                  )}

                  
                  <View className='flex-row gap-x-2'>
                    <View className='overflow-hidden rounded-md'>
                      <Pressable
                      style={{backgroundColor: "#444"}}
                      onPress={() => setMapVisible(true)}
                      android_ripple={{color: "white"}} 
                      className='grow items-center rounded-md justify-center w-12'>
                        <Ionicons name='location-outline' size={20} color={"white"}/>
                      </Pressable>
                    </View>

                    
                    <TextInput
                    editable={false}
                    onChangeText={handleAddressChange}
                    value={address}
                    className='py-2 px-5 rounded-md bg-gray-50 w-72'/>
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
                  className='py-2 px-5 rounded-md bg-gray-50'/>
                </View>
              </View>

            <View className='overflow-hidden rounded-md mt-10 relative -bottom-56 w-full self-center'>
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

         <Modal
         visible={mapVisible}>
            <MapView
            showsMyLocationButton
            showsBuildings={false}
              className='w-full h-full'
              initialRegion={{
                latitude: location?.latitude,
                longitude: location?.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
            {location && (
              <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={handleMarkerDrag}
              />
            )}
            </MapView>
            <View className='w-80 bg-white p-2 absolute z-10 top-3 self-center rounded-md border border-gray-300'>
              <Text className='text-center'>Press and hold the marker, then drag it to your property location.</Text>
            </View>

            <Pressable 
            onPress={reverseGeocode}
            style={{backgroundColor: "#444"}}
            className='w-80 bg-white p-3 absolute z-10 bottom-3 self-center rounded-md border border-gray-300'>
              <Text className='text-center text-white'>Save this location</Text>
            </Pressable>

          </Modal>
       </>
        )}
      </TouchableWithoutFeedback> 

     
    </KeyboardAvoidingView>
  )
}
