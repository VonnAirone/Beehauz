import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '@/components/logo'
import { router } from 'expo-router'

export default function Usertype() {
  return (
    <SafeAreaView className='flex-1 items-center'>
        <View className='flex-col items-center mt-24 mb-20'>
            <View><Logo/></View>
            
            <Text className='text-3xl my-2'>
            Type of Account
            </Text>
            
            <Text className='w-60 text-center my-2'>
            Choose the type of your account, be careful. To change it is impossible
            </Text>
        </View>
        
        <View className='gap-10'>
        <View className='w-80 border border-gray-200 rounded-md overflow-hidden'>
                <Pressable 
                onPress={() =>  router.push("/(onboarding)/TenantRegistration")}
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
                onPress={() => router.push("/(onboarding)/TenantRegistration")}
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
       
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})