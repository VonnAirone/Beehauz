import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '@/components/logo'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/utils/AuthProvider'
import { supabase } from '@/utils/supabase'

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
        const {data, error} = await supabase
        .from("profiles")
        .update({"user_type": usertype})
        .eq('id', user?.id)

        if (error) {
            Alert.alert("Error updating user type", error.message)
        } else {
            router.push({pathname: "/ProfileCompletion", params: {usertype}})
            setLoading(false)
        }
    }

    // useEffect(() => {
    //     console.log()
    // })

  return (
    <SafeAreaView className='flex-1 bg-white'>


        {showModal && (
            <View className='flex-1 absolute h-screen items-center justify-center w-full z-10'>
                <View>
                    <View className='absolute z-10 top-3 right-3'>
                        <Pressable onPress={() => setShowModal(false)}>
                            <Ionicons name='close-outline' size={15}/>
                        </Pressable>
                    </View>
                    <View className='bg-white border border-gray-200 py-10 w-72 rounded-md items-center'>
                        <View className=''>
                            <Text className='text-base'>Do you wish to proceed as <Text className='uppercase font-semibold text-lg'>{usertype}</Text> ?</Text>
                        </View>



                        <View className='flex-row gap-x-5 mt-4'>
                            <View className='rounded-md overflow-hidden'>
                                <Pressable 
                                android_ripple={{color: '#FFA233'}}
                                onPress={() => setShowModal(false)}
                                className='w-24 py-3 border border-yellow rounded-md'>
                                    <Text className='text-center'>Cancel</Text>
                                </Pressable>
                            </View>

                            <View className='rounded-md overflow-hidden'>
                                <Pressable 
                                android_ripple={{color: '#FDFDD9'}}
                                onPress={updateUsertype}
                                className='w-24 py-3 bg-yellow rounded-md'>
                                    <Text className='text-center'>{loading ? 'Loading' : 'Yes'}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )}
        


        <View className={`flex-1 ${showModal && 'opacity-20'}`}>

            <Pressable 
              onPress={() => router.back()}
              className='flex-row ml-5 mt-5'>
                <Ionicons name='chevron-back-outline' size={20}/>
                <Text className='text-lg ml-1'>Back</Text>
              </Pressable>

            <View className='items-center'>
                <Logo/>
            </View>

        
        <View className='flex-col items-center mt-20 mb-20'>
            <Text className='text-3xl my-2'>
            Type of Account
            </Text>
            
            <Text className='w-60 text-center my-2'>
            Choose the type of your account, be careful. To change it is impossible
            </Text>
        </View>
        
        {/* router.push({pathname: "/(tenant)/(screens)/BHDetails", params: {propertyID: propertyID}}) */}
        
        <View className='gap-10 items-center'>
        <View className='w-80 border border-gray-200 rounded-md overflow-hidden'>
                <Pressable 
                onPress={() => confirmUsertype("Tenant")}
                // onPress={() =>  router.push({pathname: "/ProfileCompletion", params: {usertype: 'Tenant'}})}
                className='p-5 h-40 rounded-md flex-row items-center justify-between' 
                android_ripple={{color: '#FCA311'}}>
                    <View>
                        <Text className='text-lg font-semibold'>I AM A TENANT</Text>

                        <Text className='w-40 mt-10'>Find boarding houses online, make reservations, and manage bookings</Text>
                    </View>

                    <View>
                        <Image className='w-32 h-32' source={require("assets/images/tenant.jpg")}/>
                    </View>

                </Pressable>
            </View>

            <View className='w-80 border border-gray-200 rounded-md overflow-hidden'>
                <Pressable 
                onPress={() => confirmUsertype("Owner")}
                // onPress={() =>  router.push({pathname: "/(auth)/ProfileCompletion", params: {usertype: 'Owner'}})}
                className='p-5 h-40 rounded-md flex-row items-center justify-between' 
                android_ripple={{color: '#FCA311'}}>
                    <View>
                        <Text className='text-lg font-semibold'>I AM AN OWNER</Text>

                        <Text className='w-40 mt-10'>Streamline your operations and attract quality tenants</Text>
                    </View>

                    <View>
                        <Image className='w-32 h-32' source={require("assets/images/owner.jpg")}/>
                    </View>

                </Pressable>
            </View>
        </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})