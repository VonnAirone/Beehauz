import { Alert, FlatList, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { TenantsData, UserData } from '@/api/Properties';
import { getProfile } from '@/api/DataFetching';
import { useAuth } from '@/utils/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import AvatarImage from '@/app/(tenant)/(aux)/avatar';

export default function Tenants() {
  const user = useAuth();
  const [tenants, setTenants] = useState<TenantsData[] | null>(null);
  const [tenantsProfiles, setTenantsProfiles] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [propertyID, setPropertyID] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);

  async function getTenants() {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("property_id", propertyID);

      if (error) {
        console.log("Error fetching tenants: ", error.message);
      } else {
        setTenants(data);
        fetchTenantsProfiles(data);
      }
    } catch (error) {
      console.log("Error fetching tenants: ", error.message);
    }
  }

  async function getProperties() {
    try {
      const { data, error } = await supabase.from("property")
        .select()
        .eq("owner_id", user?.session.user.id)

      if (error) {
        console.log("Error fetching properties: ", error.message);
        return;
      }

      if (data && data.length > 0) {
        setPropertyID(data[0]?.property_id);
      }
    } catch (error) {
      console.log("Error fetching properties: ", error.message);
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
    async function fetchData() {
      try {
        await getProperties();
        if (propertyID) {
          await getTenants();
        }
      } catch (error) {
        console.log("Error fetching data: ", error.message);
      } finally {
        setLoading(false)
      }
    }
  
    fetchData();
  }, [propertyID]);
  

  const debouncedSearch = debounce(async (query: string) => {
    try {
      if (query.trim() === '') {
        setSearchResults([]);
      } else {
        const filtered = tenantsProfiles?.filter((item) =>
          item.first_name.toLowerCase().includes(query.toLowerCase())
        );
        console.log(filtered)
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

  const SkeletonComponent = () => {
    return (
      <View className='bg-gray-100 mt-2 rounded-md p-5 shadow-2xl'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center gap-x-2'>
            <View className=' bg-gray-300 h-12 w-12 rounded-full'/>
            <View className='h-4 rounded-md bg-gray-300 w-20'/>
          </View>
          
          <View className='h-2 rounded-sm bg-gray-300 w-14'/>
        </View>

        <View className='p-3 gap-y-2'>
          <View className='h-3 rounded-sm bg-gray-300 w-60'/>
          <View className='h-3 rounded-sm bg-gray-300 w-60'/>
          <View className='h-3 rounded-sm bg-gray-300 w-60'/>
        </View>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback className='bg-slate-300 flex-1' onPress={() => Keyboard.dismiss}>
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <View className='mb-4 flex-row items-center justify-between'>
          <Text className='font-semibold text-xl'>Manage your Tenants</Text>
          <Pressable className='p-3 bg-yellow rounded-md'>
            <Ionicons name='person-add' color={"white"} size={20}/>
          </Pressable>
        </View>

        <View className='flex-row items-center border border-gray-100  rounded-md p-2 backdrop-blur-3xl'>
          <View className='mx-2'>
            <Ionicons name='search' size={20} color={'#ffa233'}/>
          </View>
          <TextInput
            placeholder='Search for a user'
            value={searchQuery}
            onChangeText={handleOnChangeText}
          />
        </View>

        {loading ? (
          <View className='gap-y-2 mt-2'>
            {[...Array(1)].map((_, index) => (
             <SkeletonComponent key={index}/>
            ))}
          </View>
        ) : (
          <View className='gap-y-2 mt-2'>
            <FlatList
              data={tenantsProfiles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View key={index} className="overflow-hidden rounded-md">
                  <Pressable
                    android_ripple={{ color: "#ffa233" }}
                    className="p-5 bg-gray-100 shadow-lg rounded-md"
                  >
                  <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-x-2'>
                      <View className='h-12 w-12'>
                        <AvatarImage userID={tenants[index].tenant_id}/>
                      </View>
                      <Text>{item.first_name}</Text>
                    </View>
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons
                        name='ellipse'
                        color={tenants && tenants[index].status === "Active" ? "green" : "gray"}
                      />
                      <Text className='text-xs'>{tenants && tenants[index].status}</Text>
                    </View>
                  </View>

                  <View className='p-3'>
                    <View className='flex-row items-center gap-x-2'>
                      <Ionicons name='call'  color={"#ffa233"}/>
                      <Text>{item.phone_number}</Text>
                    </View>

                    <View className='flex-row items-center gap-x-2'>
                      <Ionicons name='mail'  color={"#ffa233"}/>
                      <Text>{item.email}</Text>
                    </View>

                    <View className='flex-row items-center gap-x-2'>
                      <Ionicons name='location' color={"#ffa233"}/>
                      <Text>{item.address}</Text>
                    </View>
                  </View>
                  </Pressable>
                </View>
              )}
            />
          </View>
        )}

          
      </View>
    </SafeAreaView>
  </TouchableWithoutFeedback>
  );
}
