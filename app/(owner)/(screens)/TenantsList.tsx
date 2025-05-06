import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/app/components/back-button'
import { supabase } from '@/utils/supabase'
import { TenantsData, UserData } from '@/app/api/Properties'
import { getProfile } from '@/app/api/DataFetching'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import debounce from 'debounce'
import AvatarImage from '../../(tenant)/(aux)/avatar'

export default function TenantsList() {
  const params = useLocalSearchParams();
  const [tenants, setTenants] = useState([])
  const [tenantsProfiles, setTenantsProfiles] = useState<UserData[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);

  const debouncedSearch = debounce(async (query: string) => {
    try {
      if (query.trim() === '') {
        setSearchResults([]);
      } else {
        const filtered = tenantsProfiles?.filter((item) =>
          item.first_name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  }, 300);

  const handleOnChangeText = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };
  
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
        // Fetch tenants from the rentals table based on property ID and payment status
        const { data: rentalsData, error: rentalsError } = await supabase
            .from('rentals')
            .select('tenant_id')
            .eq('property_id', params.propertyID)
            .eq('status', 'Payment Successful');
        
        if (rentalsError) {
            console.error('Error fetching rentals:', rentalsError);
            return;
        }


        if (rentalsData && rentalsData.length > 0) {
            const tenantIds = rentalsData.map((rental) => rental.tenant_id);
            const { data: tenantsData, error: tenantsError } = await supabase
                .from('tenants')
                .select('*')
                .in('tenant_id', tenantIds)
                .eq('status', 'Available');

            if (tenantsError) {
                console.error('Error fetching tenants:', tenantsError);
                return;
            }

            if (tenantsData && tenantsData.length > 0) {
                setTenants(tenantsData);
                fetchTenantsProfiles(tenantsData);
            }
        }
    } catch (error) {
        console.error('Error fetching tenants:', error);
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

  async function subscribeToRentalChanges() {
    const channels = supabase
      .channel('status-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rentals' },
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
    subscribeToRentalChanges()    
  }, [])
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>

        <View className='mt-4 mb-4'>
          <Text className='text-lg font-semibold'>List of Approved Tenants</Text>
        </View>

        <View className='flex-row items-center bg-gray-50  rounded-md p-2 backdrop-blur-3xl'>
          <View className='mx-2'>
            <Ionicons name='search' size={20} color={'#444'}/>
          </View>
          <TextInput
            placeholder='Search for a user'
            value={searchQuery}
            onChangeText={handleOnChangeText}
          />
        </View>

        <View className='mt-4'>
          <FlatList
          showsVerticalScrollIndicator={false}
          data={searchQuery ? searchResults : tenantsProfiles}
          renderItem={({item, index}) => (
            <View key={index} className="overflow-hidden rounded-md mb-4">
              <Pressable
                onPress={() => 
                  router.push({
                    pathname: "/(owner)/(screens)/TenantProfile", 
                    params: {tenant_id: tenants[index]?.tenant_id, status: tenants[index]?.status, propertyID: params?.propertyID
                  }})
                }
                android_ripple={{ color: "#444" }}
                className="p-5 bg-gray-50 shadow-lg rounded-md"
              >
              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-x-2'>
                  <View className='h-12 w-12'>
                    <AvatarImage userID={tenants[index]?.tenant_id}/>
                  </View>

                  <View>
                    <Text>{item.first_name} {item.last_name}</Text>
                  </View>
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