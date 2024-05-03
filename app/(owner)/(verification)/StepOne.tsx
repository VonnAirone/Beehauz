import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Pressable, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { uploadID } from '@/api/ImageFetching';
import { useAuth } from '@/utils/AuthProvider';
import { router } from 'expo-router';

export default function StepOne() {
  const user = useAuth()?.session?.user?.id
  const device = useCameraDevice('back')
  const [imageSource, setImageSource] = useState('');
  const camera = useRef<Camera>(null)
  const [loading, setLoading] = useState(false)

  const capturePhoto = async () => {
    if (camera.current !== null) {
      const photo = await camera.current.takePhoto({});
      setImageSource(`file://'${photo.path}`);
    }
  };


  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 720 } }
  ])
  
  useEffect(() => {
    async function getPermission() {
      const permission = await Camera.requestCameraPermission();
      console.log(`Camera permission status: ${permission}`);
      if (permission === 'denied') await Linking.openSettings();
    }
    getPermission();
  }, []);


  async function submitID() {
    try {
      setLoading(true)
      await uploadID(user, imageSource)
    } catch (error) {
      console.log("Error submitting ID: ", error.message)
    } finally {
      setLoading(false)
      router.push("/(owner)/(verification)/StepTwo")
    }
  }

  async function takeAnotherPhoto() {
    setImageSource('')
  }

  if (!device) return <Text>Loading camera...</Text>;

  if (loading) return <View className='flex-1 items-center justify-center'>
    <ActivityIndicator/>
  </View>

  return (
    <SafeAreaView className='flex-1'>
      <View className='flex-1'>
        {!imageSource ? (
          <View className='flex-1'>
           <Camera
              ref={camera}
              photo={true}
              style={{height: '60%'}}   
              device={device}
              isActive={true}
              format={format}
            />

            <View className='items-center mt-5'>
              <Text className='text-gray-400'>STEP 1</Text>
              <Text className='text-base font-medium'>Identification Card</Text>
            </View>
 
            <View className='w-72 h-96 border-2 border-white mt-10 absolute ml-12'>
            </View>

            <View className='items-center mt-5'>
              <Text className='text-base font-medium'>CENTER PROPERLY</Text>
              <Text className='text-xs w-72 text-center'>Place ID on a clear surface. If the entire ID is clear and visible, take a photo.</Text>
            </View>

            <View className='items-center flex-1'>
              <TouchableOpacity 
              onPress={capturePhoto}
              className='absolute bottom-4'>
                <Ionicons name='ellipse-outline' color={"#444"} size={72}/>
              </TouchableOpacity>   
            </View>
          </View>
         
        ) : (
          <View className='flex-1 items-center'>
            <View className='gap-y-2 items-center mb-5 mt-5'>
                <Text className='text-gray-400'>STEP 1</Text>
                <Text className='font-medium text-base'>IDENTIFICATION CARD</Text>
                <Text>Make sure that the details are visible enough.</Text>
              </View>

            <View style={{height: "60%"}}>
              <Image
                style={{width: "100%", height: "100%", aspectRatio:'3/4'}}
                source={{
                  uri: `${imageSource}`,
                }}
              />
            </View>

            <View className='absolute z-10 bottom-5 flex-row items-center justify-center'>
            
            <View className='overflow-hidden'>
              <Pressable
              onPress={submitID}
              android_ripple={{color: "white"}} 
              style={{backgroundColor: "#444"}}
              className='bg-white w-40 p-3 rounded-md border border-gray-700 flex-row items-center justify-center mr-2'>
                <Ionicons name='push-outline' color={"white"}/>
                <Text className='text-white text-center'>Upload</Text>
              </Pressable>
            </View>
            
            <View className='overflow-hidden rounded-md'>
              <Pressable 
              onPress={takeAnotherPhoto}
              android_ripple={{color: "#444"}}
              className='p-3 w-40 border border-gray-300 rounded-md flex-row items-center justify-center'>
                <Ionicons name='refresh-outline'/>
                <Text>Take another photo</Text>
              </Pressable>
            </View>
           
            </View>
          
          </View>
        )} 
       
      </View>
     
    </SafeAreaView>
  )
}
