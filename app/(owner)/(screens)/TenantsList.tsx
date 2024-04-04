import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { supabase } from '@/utils/supabase'
import { TenantsData, UserData } from '@/api/Properties'
import { getProfile } from '@/api/DataFetching'
import { Ionicons } from '@expo/vector-icons'
import AvatarImage from '@/app/(tenant)/(aux)/avatar'
import { router, useLocalSearchParams } from 'expo-router'

export default function TenantsList() {
  const propertyID = useLocalSearchParams()
  const [tenants, setTenants] = useState([])
  const [tenantsProfiles, setTenantsProfiles] = useState<UserData[] | null>(null);
  
  async function fetchTenantsProfiles(tenantsData: TenantsData[] | null) {
    if (tenants) {
      const profilesPromises = tenantsData.map(async (tenant) => {
        const profile = await getProfile(tenant.tenant_id);
        return profile;
      });
      const profilesData = await Promise.all(profilesPromises);
      setTenantsProfiles(profilesData);
    }
  }
  
  async function fetchTenants() {
    try {
      const {data, error} = await supabase
      .from("tenants")
      .select("*")
      .is('property_id', null)

      if (data) {
        setTenants(data)
        fetchTenantsProfiles(data)
      }
    } catch (error) {
      
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
          fetchTenants()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  useEffect(() => {
    fetchTenants()
    subscribeToChanges()
    
  }, [])
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

        <View className='mt-4'>
          <Text className='text-lg font-semibold'>List of Available Tenants</Text>
        </View>

        <View className='mt-4'>
          <FlatList
          data={tenantsProfiles}
          renderItem={({item, index}) => (
            <View key={index} className="overflow-hidden rounded-md">
              <Pressable
                onPress={() => 
                  router.push({
                    pathname: "/TenantProfile", 
                    params: {tenant_id: tenants[index]?.tenant_id, status: tenants[index]?.status
                  }})
                }
                android_ripple={{ color: "#ffa233" }}
                className="p-5 bg-gray-50 shadow-lg rounded-md"
              >
              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-x-2'>
                  <View className='h-12 w-12'>
                    <AvatarImage userID={tenants[index]?.tenant_id}/>
                  </View>

                  <View>
                    <Text>{item.first_name}</Text>
                  </View>
                </View>
                <View className={`flex-row items-center gap-x-1 p-2 rounded-md ${tenants && tenants[index]?.status === "Available" ? "bg-green-200" : "bg-gray-100"}`}>
                  <Ionicons
                    name='ellipse'
                    color={tenants && tenants[index]?.status === "Available" ? "green" : "gray"}
                  />
                  <Text className='text-xs'>{tenants && tenants[index]?.status}</Text>
                </View>
              </View>

              <View className='p-3'>
                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='call'  color={"#444"}/>
                  <Text>{item.phone_number}</Text>
                </View>

                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='mail'  color={"#444"}/>
                  <Text>{item.email}</Text>
                </View>

                <View className='flex-row items-center gap-x-2'>
                  <Ionicons name='location' color={"#444"}/>
                  <Text>{item.address}</Text>
                </View>
              </View>
              </Pressable>
            </View>
          )}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})