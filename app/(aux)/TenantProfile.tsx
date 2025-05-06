import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/app/components/back-button';
import { fetchPropertyDetailsData, getProfile } from '@/app/api/DataFetching';
import { PropertyData, UserData } from '@/app/api/Properties';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import AvatarImage from '../(tenant)/(aux)/avatar';

export default function TenantProfile() {
  let { tenant_id} = useLocalSearchParams()
  const [tenantData, setTenantData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenantStatus, setTenantStatus] = useState()
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null) 
  let { propertyID } = useGlobalSearchParams();

  async function getTenantStatus() {
    try {
      const {data, error} = await supabase.from("tenants").select().eq('tenant_id', tenant_id)
      if (data) {
        setTenantStatus(data[0]?.status)
      }

      if (data[0]?.property_id) {
        const property = await fetchPropertyDetailsData(data[0]?.property_id)
        setPropertyData(property)
      }
    } catch (error) {
      console.log("Error fetching tenant status");
    }
  }

 

  async function getTenantProfile() {
    try {
      const data = await getProfile(tenant_id.toString())
      if (data) {
        setTenantData(data)
      }
    } catch (error) {
      console.log("Error fetching tenant's profile: ", error.message)
    }
  }

  async function fetchData() {
    try {
      setLoading(true)
      await getTenantProfile()
      await getTenantStatus()
    } catch (error) {
      console.log("Error fetching data: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function subscribeToChanges() {
    const channels = supabase
      .channel('status-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        (payload) => {
          console.log('Change received!', payload);
          fetchData()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  useEffect(() => {
    fetchData()
    subscribeToChanges()
  }, [])

  const dateJoined = new Date(tenantData?.date_joined);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const month = monthNames[dateJoined.getMonth()];
  const year = dateJoined.getFullYear();

  const formattedDate = `${month} ${year}`;

  const addTenantToProperty = async () => {
    // const TenantData = {
    //   status: 'Boarding',
    //   property_id: propertyData?.property_id
    // }
    // try {
    //   const {data, error} = await supabase
    //   .from("tenants")
    //   .update(TenantData)
    //   .eq('tenant_id', tenant_id)

    //   if (data) {
    //     console.log("Successfully updated tenant status")
    //   }

    //   if (error) {
    //     console.log("Error updating tenant status: ", error.message)
    //   }

    // } catch (error) {
    //   console.log("Error updating tenant information: ", error.message)
    // } finally {
    //   console.log("Successfully updated tenant status!")
    // }
  }


  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

        {loading ? (
          <View className='justify-center h-full items-center'>
            <ActivityIndicator color={"#444"} size={20}/>
          </View>
        ) : (
          <View className='h-full'>
            <View 
            style={{backgroundColor: '#444'}}
            className='items-center rounded-md mt-2 h-32 mb-6'>
              <View className='absolute -bottom-10 rounded-full border-2 border-gray-200 bg-white h-28 w-28'>
                  <AvatarImage userID={tenantData?.id}/>
              </View>
            </View>
    
            <View>
              <View className='items-center mt-5'>
                <Text className='text-2xl font-semibold'>{tenantData?.first_name} {tenantData?.last_name}</Text>
                <Text>Joined last {formattedDate}</Text>
                {tenantStatus && tenantStatus !== 'Available' && (
                  <Text>Boarding at {propertyData?.name}</Text>
                )}
              </View>
    
              <View className='gap-y-3 mt-4'>
                <Text className='font-semibold'>Contact Details</Text>
                <View className='flex-row items-center gap-x-4'>
                    <Ionicons name='call' size={18}/>
                    <Text className='text-base'>{tenantData?.phone_number}</Text>
                </View>
    
                <View className='flex-row items-center gap-x-4'>
                    <Ionicons name='location' size={18}/>
                    <Text className='text-base'>{tenantData?.address}</Text>
                </View>
    
                <View className='flex-row items-center gap-x-4'>
                  <Ionicons name='mail' size={18}/>
                  <Text className='text-base'>{tenantData?.email}</Text>
                </View>
    
                <View className='flex-row items-center gap-x-4'>
                  <Ionicons name='logo-facebook' size={18}/>
                  <Text className='text-base'>{tenantData?.first_name} {tenantData?.last_name}</Text>
                </View>
              </View>
    
              <View className='mt-4'>
                <Text className='font-semibold'>Reviews</Text>
                <Text className='text-xs italic'>Note: Only previous property owners from whom tenants came can leave reviews.</Text>
              </View>
            </View>

            {tenantStatus && tenantStatus === 'Available' && (
            <View className='rounded-md overflow-hidden bottom-10 absolute w-80 self-center'>
              <Pressable 
              onPress={() => addTenantToProperty()}
              android_ripple={{color: 'white'}}
              style={{backgroundColor: "#444"}}
              className='flex-row items-center justify-center p-3 rounded-md'>
                <Ionicons color={'white'} name='add-outline'/>
                <Text className='text-white'>Add tenant to property</Text>
              </Pressable>
            </View>
            )}
        </View>
        )}
      </View>
    </SafeAreaView>
  )
}