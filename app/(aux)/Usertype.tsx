import { Alert, Pressable, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@/utils/AuthProvider'
import { supabase } from '@/utils/supabase'
import BackButton from '@/components/back-button'

export default function Usertype() {
    const user = useAuth().session?.user
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [usertype, setUsertype] = useState('')

    async function confirmUsertype (usertype) {
        setUsertype(usertype)
        setShowModal(true)
    }

    async function updateUsertype () {
        setLoading(true)
        setUsertype(usertype)
        const { data, error } = await supabase
        .from("users")
        .update({ "usertype": usertype })
        .eq("id", user?.id);
      

        if (error) {
            Alert.alert("Error updating user type", error.message)
            console.log(error.details)
        } else {
            setShowModal(false)
            router.push({pathname: "/ProfileCompletion", params: {usertype}})
            setLoading(false)
        }
    }



  return (
    <SafeAreaView className='flex-1 bg-white'>


      {showModal && (
        <View className='flex-1 absolute h-screen items-center justify-center w-full z-10'>
          <View>
            <View className='bg-gray-100 p-5 rounded-md items-center'>
              <View className=''>
                <Text className='text-base'>Do you wish to proceed as <Text className='uppercase font-semibold text-lg'>{usertype}</Text> ?</Text>
              </View>



              <View className='flex-row gap-x-5 mt-4'>
                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  android_ripple={{color: '#FFA233'}}
                  onPress={() => setShowModal(false)}
                  className='w-24 py-3 border border-yellow rounded-md'>
                      <Text className='text-center font-semibold'>CANCEL</Text>
                  </Pressable>
                </View>

                <View className='rounded-md overflow-hidden'>
                  <Pressable 
                  style={{backgroundColor: "#444"}}
                  android_ripple={{color: '#FDFDD9'}}
                  onPress={updateUsertype}
                  className='w-24 py-3 rounded-md'>
                      <Text className='text-center text-white font-semibold'>{loading ? 'Loading' : 'YES'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      
        <View className={`flex-1 ${showModal && 'opacity-20'} p-5`}>
          <BackButton/>

          <View className='flex-col items-center mt-10 mb-20'>
            <Text className='text-3xl my-2 font-semibold'>
            Type of Account
            </Text>
            
            <Text className='w-80 text-center my-2'>
            Please select your account type thoughtfully, as changes cannot be made once chosen.
            </Text>
          </View>
        
        <View className='gap-10 items-center'>
          <View className='w-80 bg-orange-100 rounded-md overflow-hidden'>
                <Pressable 
                onPress={() => confirmUsertype("Tenant")}
                className='p-5 h-40 rounded-md flex-row items-center justify-between' 
                android_ripple={{color: '#FCA311'}}>
                    <View>
                        <Text className='text-lg font-semibold'>I AM A TENANT</Text>

                        <Text className='mt-5'>Find boarding houses online, make reservations, and manage bookings</Text>
                    </View>

                </Pressable>
            </View>

            <View className='w-80 bg-gray-100 rounded-md overflow-hidden'>
                <Pressable 
                onPress={() => confirmUsertype("Owner")}
                className='p-5 h-40 rounded-md flex-row items-center justify-between' 
                android_ripple={{color: '#FCA311'}}>
                    <View>
                        <Text className='text-lg font-semibold'>I AM AN OWNER</Text>

                        <Text className='mt-5'>Streamline your operations and attract quality tenants</Text>
                    </View>
                </Pressable>
            </View>
          </View>
        </View>
    </SafeAreaView>
  )
}