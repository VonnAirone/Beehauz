import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/back-button';
import AvatarImage from '@/app/(tenant)/(aux)/avatar';
import { fetchPropertyDetailsData, getProfile } from '@/api/DataFetching';
import { PropertyData, UserData } from '@/api/Properties';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export default function TenantProfile() {
  let { tenant_id} = useLocalSearchParams()
  const [tenantData, setTenantData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [tenantStatus, setTenantStatus] = useState()
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null) 

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
      setLoading(true)
      const data = await getProfile(tenant_id.toString())
      if (data) {
        setTenantData(data)
      }
    } catch (error) {
      console.log("Error fetching tenant's profile: ", error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchData() {
    await getTenantProfile()
    await getTenantStatus()
  }

  async function listenToTenantTableChanges() {
    const changes = supabase.channel('custom-all-channel')
    .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tenants' },
    (payload) => {
      console.log('Change received!', payload);
      fetchData()
    }
    )
    return () => {
        changes.unsubscribe();
    };
  }

  useEffect(() => {
    fetchData()
    listenToTenantTableChanges()
  }, [])

  const dateJoined = new Date(tenantData?.date_joined);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const month = monthNames[dateJoined.getMonth()];
  const year = dateJoined.getFullYear();

  const formattedDate = `${month} ${year}`;

  async function addTenantToProperty(status) {
    try {
      const {data, error} = await supabase
      .from("tenants")
      .update({status: status})
      .eq('tenant_id', tenant_id)

      if (data) {
        console.log("Successfully updated tenant status")
      }

      if (error) {
        console.log("Error updating tenant status: ", error.message)
      }

      if (error) throw Error
    } catch (error) {
      console.log("Error updating tenant information: ", error.message)
    }
  }


  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

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
      </View>


        {tenantStatus && tenantStatus === 'Available' && (
        <View className='rounded-md overflow-hidden bottom-3 absolute w-80 self-center'>
          <Pressable 
          onPress={() => addTenantToProperty('Boarding')}
          android_ripple={{color: 'white'}}
          style={{backgroundColor: "#444"}}
          className='flex-row items-center justify-center p-3 rounded-md'>
            <Ionicons color={'white'} name='add-outline'/>
            <Text className='text-white'>Add tenant to property</Text>
          </Pressable>
        </View>
        )}
       
    </SafeAreaView>
  )
}