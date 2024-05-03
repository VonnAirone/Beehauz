import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { uploadID } from '@/api/ImageFetching';
import { useAuth } from '@/utils/AuthProvider';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function StepThree() {
  const user = useAuth()?.session?.user;
  const [businessPermitImage, setBusinessPermitImage] = useState('');
  const [businessOwnershipImage, setBusinessOwnershipImage] = useState('');
  const device = useCameraDevice('back')
  const [showCamera, setShowCamera] = useState(false)
  const camera = useRef<Camera>(null);
  const [activeDocumentType, setActiveDocumentType] = useState(null)
  const [loading, setLoading] = useState(false)

  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 720 } }
  ])
  
  const capturePhoto = async () => {
    if (camera.current !== null) {
      const photo = await camera.current.takePhoto({});
      if (activeDocumentType === 'Business Permit') {
        setBusinessPermitImage(`file://'${photo.path}`)
        console.log(businessPermitImage)
      } else if (activeDocumentType === 'Business Ownership') {
        setBusinessOwnershipImage(`file://'${photo.path}`)
      }
      
      setShowCamera(false)
      setActiveDocumentType(null)
    }
  };

  const activateCamera = (documentType) => {
    setActiveDocumentType(documentType)
    setShowCamera(true)
  }

  const handleSubmission = async () => {
    try {
      setLoading(true)
      await Promise.all([
        uploadID(user?.id, businessOwnershipImage),
        uploadID(user?.id, businessPermitImage)
      ])

      const {data, error} = await supabase
      .from('owners')
      .update({status: 'Pending Verification'})
      .eq('owner_id', user?.id)

      if (error) {
        console.log("Error updating owner status: ", error.message)
      }
    } catch (error) {
      console.log("Error submitting documents: ", error.message)
    } finally {
      setLoading(false)
      router.push("/(owner)/(verification)/Confirmation")
    }
  
  }

  return (
    <SafeAreaView className='flex-1'>
      {showCamera ? (
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
            <Text className='text-gray-400'>STEP 3</Text>
            <Text className='text-base font-medium'>Upload Your Documents</Text>
          </View>

          <View className='w-72 h-96 border-2 border-white mt-10 absolute ml-12'>
          </View>

          <View className='items-center mt-5'>
            <Text className='text-base font-medium'>MAKE SURE THE DETAILS ARE VISIBLE</Text>
            <Text className='text-xs w-72 text-center'>Place document on a clear surface. If the entire document is clear and visible, take a photo.</Text>
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
      <View className='p-5'>
        <View className='items-center'>
          <Text className='text-gray-400'>Last Step</Text>
          <Text className='text-base font-medium'>Submit Documents</Text>

          <Text className='text-center text-xs mt-2'>Beehauz requires you to submit the necessary documents to confirm that you are a registered business owner.</Text>
        </View>

        <View className='mt-10'>
          <View className='mb-4'>
            <Text>Name: </Text>
            <TextInput 
            className='bg-gray-200 py-2 px-5 rounded-md mt-1'
            placeholder='Enter your full name'/>
          </View>
          <View className='mb-4'>
            <Text>Email: </Text>
            <TextInput 
            className='bg-gray-200 py-2 px-5 rounded-md mt-1'
            placeholder={user?.email}/>
          </View>
          <View className='mb-4'>
            <Text>Contact Number: </Text>
            <TextInput 
            className='bg-gray-200 py-2 px-5 rounded-md mt-1'
            placeholder='Enter your contact number'/>
          </View>
        </View>

        <View className='mt-3'>
          <Text className='font-medium'>Documents Required</Text>
          <Text className='text-sm text-gray-600'>Please upload the following documents:</Text>
          <View className='mt-2 mb-4'>
            <Text>1. Business Permit:</Text>
            <View className='rounded-md overflow-hidden mt-1'>
              <Pressable 
              onPress={() => activateCamera('Business Permit')}
              android_ripple={{color: "#444"}}
              className='bg-gray-200 p-3 rounded-md flex-row items-center justify-center'>
                {businessPermitImage ? (
                  <View className='flex-row items-center'>
                    <Ionicons name='document-attach-outline' size={15}/>
                    <Text className='ml-1'>File Attached</Text>
                  </View>
                ) : (
                  <>
                   <Ionicons name='push-outline' color={"gray"}/>
                    <Text className='ml-2 text-gray-400'>Upload business permit</Text>
                  </>
                )}
               
              </Pressable>
            </View>
            
          </View>
          <View>
            <Text>2. Proof of Business Ownership:</Text>
            <View className='rounded-md overflow-hidden mt-1'>
              <Pressable 
              onPress={() => activateCamera('Business Ownership')}
              android_ripple={{color: "#444"}}
              className='bg-gray-200 p-3 rounded-md flex-row items-center justify-center'>
                {businessOwnershipImage ? (
                  <View className='flex-row items-center'>
                    <Ionicons name='document-attach-outline' size={20}/>
                    <Text>File Attached</Text>
                  </View>
                  
                ) : (
                  <>
                   <Ionicons name='push-outline' color={"gray"}/>
                    <Text className='ml-2 text-gray-400'>Upload proof of business ownership</Text>
                  </>
                )}
               
              </Pressable>
            </View>
            
          </View>
        </View>

        <View className='overflow-hidden rounded-md mt-10'>
          <Pressable
          android_ripple={{color: "white"}}
          style={{backgroundColor:"#444"}}
          className='p-3 rounded-md'
          onPress={handleSubmission}>
            <Text className='text-white text-center'>{loading ? 'Loading' : 'Submit'}</Text>
          </Pressable> 
        </View>
       
      </View>
      )}
      
    </SafeAreaView>
  );
}
