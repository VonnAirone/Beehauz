import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { supabase } from '@/utils/supabase'
import { TenantsData, UserData } from '@/api/Properties'
import { getProfile } from '@/api/DataFetching'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import LottieView from 'lottie-react-native'

export default function Tenants() {
  const [tenants, setTenants] = useState<TenantsData[] | null>(null);
  const [tenantsProfiles, setTenantsProfiles] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();

  async function getTenants() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("property_id", params.property_id);

      if (error) {
        console.log("Error fetching tenants: ", error.message);
      } else {
        setTenants(data);
        fetchTenantsProfiles(data);
      }
    } catch (error) {
      console.log("Error fetching tenants: ", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTenantsProfiles(tenantsData: TenantsData[] | null) {
    if (tenantsData) {
      const profilesPromises = tenantsData.map(async (tenant) => {
        const profile = await getProfile(tenant.tenant_id);
        return profile;
      });
      const profilesData = await Promise.all(profilesPromises);
      setTenantsProfiles(profilesData);
    }
  }

  useEffect(() => {
    getTenants();
  }, []);

  return (
    <SafeAreaView className='flex-1'>
      <View>
        <BackButton/>
      </View>

      <View className='px-10 py-5'>
           <View className='h-10 w-10'>
              <LottieView
              autoPlay
              loop
              style={{width: "100%", height: "100%"}}
              source={require("@/assets/avatar.json")}/>
            </View>
        <Text className='text-xl'>Manage your Tenants</Text>
      </View>

      {loading ? (
        <View className='px-10 gap-y-2'>
          {[...Array(tenants)].map((_, index) => (
            <View key={index} className='bg-gray-100 rounded-md h-14 flex-row justify-between p-5 items-center'>
              <View className='h-4 rounded-md bg-gray-300 w-20'/>
              <View className='h-2 rounded-sm bg-gray-300 w-24'/>
            </View>
          ))}
        </View>
      ) : (
      <View className='px-10 gap-y-2'>
          <FlatList
            data={tenantsProfiles}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
            <View key={index} className="overflow-hidden rounded-md">
              <Pressable
                android_ripple={{ color: "#ffa233" }}
                className="justify-between p-5 bg-gray-100 rounded-md flex-row items-end"
              >
                <Text>{index + 1}. {item.first_name}</Text>
                <View className="flex-row items-center gap-x-1">
                  <Ionicons
                    name='ellipse'
                    color={tenants[index].status === "Active" ? "green" : "gray"}
                  />
                  <Text className='text-xs'>{tenants[index].status}</Text>
                </View>
              </Pressable>
            </View>
          )}
        />
      </View>
      )}
    </SafeAreaView>
  )
}
