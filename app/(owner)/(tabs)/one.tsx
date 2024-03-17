import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '@/components/logo'
import { useAuth } from '@/utils/AuthProvider'
import { Ionicons } from '@expo/vector-icons'
import { Reviews } from '@/app/(tenant)/(aux)/detailscomponent'
import StarRatingComponent from '@/app/(tenant)/(aux)/starrating'
import { getProfile } from '@/api/DataFetching'
import { OwnerData, PropertyData, ReviewData } from '@/api/Properties'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'

export default function Dashboard() {
  const session = useAuth()
  const user = session?.session.user.id;
  const [userProfile, setUserProfile] = useState<OwnerData | null>(null)
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);
  const hasFetched = useRef(null)
  
  useEffect(() => {
    getUserProfile(user)
    getProperties()
    // getPropertyReviews()
  }, [])

  async function getUserProfile(id: string) {
    try {
        const data = await getProfile(id);
        setUserProfile(data);
    } catch (error) {
        console.log("Error fetching owner", error.message);
        throw error;
    }
  }

  async function getProperties() {
    try {
        const { data, error } = await supabase
            .from("property")
            .select("*")
            .eq('owner_id', user);

        if (error) {
            console.log("Error fetching properties: ", error.message);
            return null;
        } else {
            setProperties(data);
        }
    } catch (error) {
        console.log("Error fetching properties: ", error.message);
        return null;
    }
  }
  
  async function getPropertyReviews() {
    try {
        const { data, error } = await supabase
            .from("property_reviews")
            .select("*")
            .eq('property_id', properties[1]?.property_id.toString());

        if (error) {
            console.log("Error fetching property reviews: ", error.message);
            return null;
        }

        if (data) {
            setPropertyReviews(data);
        } else {
            console.log("No property reviews found.");
        }
    } catch (error) {
        console.log("Error fetching property reviews: ", error.message);
        return null;
    }
}


  return (
    <SafeAreaView className='flex-1 p-3'>
      <View className='items-start'>
        <Logo/>
        <View className=''></View>
      </View>

      <View className='p-5'>
        <Text className='text-4xl'>Hello <Text>{userProfile?.first_name}</Text></Text>

        <View className='mt-2'>
          <Text>This is what we have for you today.</Text>
        </View>

        {/* PROPERTIES */}
        <View className='flex-row items-center justify-around mt-10'>
          <View className='shadow-lg w-36 p-4 h-32 bg-white rounded-md'>
            <View className='flex-row items-center gap-x-2'>
              <Ionicons name='storefront' size={18} color={"#ffa233"}/>
              <Text className='text-xs'>No. of Properties</Text>
            </View>
            
            <View className='items-center flex-1 justify-center mt-4'>
              {properties ? (
                 <Text className='text-5xl text-yellow'>{properties ? properties.length : 0}</Text>   
              ) : (
                <TouchableOpacity 
                onPress={() => router.push("/PropertyCreation")}
                className='items-center flex-1 '>
                  <Ionicons name='add-circle-outline' size={32}/>
                  <Text>Add a Property</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* TENANTS */}
          <View className='shadow-lg w-36 p-4 h-32 bg-white rounded-md'>
            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='people' size={18} color={"#ffa233"}/>
              <Text className='text-xs'>No. of Tenants</Text>
            </View>
            <View className='items-center justify-center flex-1 mt-4'>
              <Text className='text-5xl text-yellow'>20</Text>
            </View>
          </View>
        </View>

        {/* BOOKINGS */}
        <View className='flex-row items-center justify-around mt-5'>
          <View className='shadow-lg w-36 p-4 h-32 bg-white rounded-md'>
            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='calendar' size={18} color={"#ffa233"}/>
              <Text className='text-xs'>No. of Bookings</Text>
            </View>
            
            <View className='items-center flex-1 justify-center mt-4'>
              <Text className='text-5xl text-yellow'>0</Text>
            </View>
          </View>
          
        {/* UNPAID VOICES */}
          <View className='shadow-lg w-36 p-4 h-32 bg-white rounded-md'>
            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='wallet' size={18} color={"#ffa233"}/>
              <Text className='text-xs'>Unpaid Tenants</Text>
            </View>
            <View className='items-center justify-center flex-1 mt-4'>
              <Text className='text-5xl text-yellow'>10</Text>
            </View>
          </View>
        </View>

        <View className='mt-8 border-2 border-gray-200'></View>

        <View className='mt-3'>
          <Text>Property Reviews <Text> (3)</Text></Text>
        </View>

        <View className='mt-3'>
          <View className='gap-x-2 justify-start border-gray-300 border p-3 rounded-lg bg-white'>
            <View className='flex-row items-center'>
                <View>
                  <Image className='w-12 h-12' source={require("@/assets/images/icon.png")} />
                </View>
                
                <View className='ml-2'>
                  <View>
                      <Text className='font-semibold text-lg'>Username</Text>
                  </View>
                  <View>
                  <StarRatingComponent rating={1}/>
                  </View>
                </View>
            </View>
            <View className='pl-14 my-1'>
              <View className='w-56 text-balance'>
                  <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})