import { Pressable, SafeAreaView, Text, View, Modal, Alert, TextInput, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { getProfile } from '@/api/DataFetching';
import { UserData } from '@/api/Properties';
import { downloadAvatar, loadAvatar } from '@/api/ImageFetching';
import { Images } from '@/app/(tenant)/(aux)/homecomponents';
import AvatarImage from '@/app/(tenant)/(aux)/avatar';
import { router } from 'expo-router';

export default function Account() {
  const auth = useAuth();
  const user = auth.session?.user;
  const [modalVisible, setModalVisible] = useState(false);
  const [onEditMode, setOnEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserData | null>(null)

  useEffect(() => {
    async function getUserProfile(id: string) {
      try {
          const data = await getProfile(id);
          setUserProfile(data);
      } catch (error) {
          console.log("Error fetching owner", error.message);
          throw error;
      }
    }

    getUserProfile(user?.id)
  }, [userProfile]);


  async function signOUt() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log('Error message', error.message)
    }
  } 

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className='flex-1 px-10'>

        <View className='items-center mt-10'>
          <View className='h-20 w-20 rounded-full'>
            <AvatarImage userID={user?.id}/>
          </View>
          <Text className='text-xl font-semibold mt-3'>{userProfile?.first_name} {userProfile?.last_name}</Text>
        </View>

        <View className='flex-row justify-between mt-5'>
          <Text className='font-semibold text-yellow'>Personal Information</Text>
          <Pressable 
          onPress={() => router.push('/ManageProfile')}
          className='flex-row items-center gap-x-1'>
            <Ionicons name='chevron-forward-outline'/>
          </Pressable>
        </View>

          {onEditMode && (
          <View className='self-center absolute top-10 p-3 rounded-md bg-yellow'>
            <Text className='text-center'>On Edit Mode</Text>
          </View>
          )}


        <View className='gap-y-3 mt-3 mb-10'>
          <View className='flex-row justify-between p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='mail-outline' size={18}/>
              <Text className='font-semibold'>Email</Text>
            </View>

            <View>
              <TextInput 
                className='text-xs text-right'
                placeholder={userProfile?.email}/>
            </View>
          </View>

          <View className='border-b opacity-10'></View>

          <View className='flex-row justify-between p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='phone-portrait-outline' size={18}/>
              <Text className='font-semibold'>Phone</Text>
            </View>

            <View className='relative w-40'>
              <TextInput 
              editable={onEditMode} 
              placeholderTextColor={onEditMode? 'black' : 'gray'} 
              value={userProfile?.phone_number.toString()}
              className='text-right text-xs'/>
            </View>
          </View>

          <View className='border-b opacity-10'></View>

          <View className='flex-row justify-between p-2'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='location-outline' size={18}/>
              <Text className='font-semibold'>Location</Text>
            </View>

            <View>
              <TextInput 
              editable={onEditMode}
              placeholderTextColor={onEditMode? 'black' : 'gray'}
              value={userProfile?.address}
              className='text-right text-xs'/>
            </View>
          </View>

        </View>

        <View>
          <Text className='font-semibold text-yellow'>Utilities</Text>
        </View>

        <View className='gap-y-3 mt-3 mb-10'>
          <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2'>
                <Ionicons name='document-text-outline' size={18}/>
                <Text className='font-semibold'>Transaction History</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          <View className='border-b opacity-10'></View>

          <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2'>
                <Ionicons name='information-circle-outline' size={18}/>
                <Text className='font-semibold'>Help Center</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          <View className='border-b opacity-10'></View>

          <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2'>
                <Ionicons name='star-half-outline' size={18}/>
                <Text className='font-semibold'>Rate this app</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>

          <View className='border-b opacity-10'></View>

          <Pressable
          onPress={() => setModalVisible(true)}
          android_ripple={{color: 'f1f1f1'}} 
          className='p-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center gap-x-2'>
                <Ionicons name='log-out-outline' size={18}/>
                <Text className='font-semibold'>Logout</Text>
              </View>

              <View>
                <Ionicons name='chevron-forward-outline'/>
              </View>
            </View>
          </Pressable>
        </View>

        
        {/* MODAL AREA */}
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>

          <View className='flex-1 justify-center items-center'>
            <View className='bg-white h-40 w-80 rounded-md justify-center border border-gray-200'>

              <Pressable
              onPress={() => setModalVisible(false)} 
              className='absolute top-2 right-3'>
                <Ionicons name='close-outline' size={20}/>
              </Pressable>

              <Text className='text-center font-semibold mb-5'>Are you sure about logging out?</Text>
              <View className='flex-row justify-evenly'>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  onPress={() => setModalVisible(false)}
                  android_ripple={{color: 'gray'}}
                  className='border border-gray-200 rounded-md px-2 py-3 w-32'>
                    <Text className='text-center font-semibold'>Cancel</Text>
                  </Pressable>
                </View>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  onPress={signOUt}
                  android_ripple={{color: '#fdfdd9'}}
                  className='bg-yellow px-2 py-3 w-32 rounded-md'>
                    <Text className='text-center font-semibold'>Logout</Text>
                  </Pressable>
                </View>

              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

