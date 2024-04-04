import { Alert, FlatList, Keyboard, Pressable, Text, TextInput, View, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { TenantsData, UserData } from '@/api/Properties';
import { getProfile } from '@/api/DataFetching';
import { useAuth } from '@/utils/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import AvatarImage from '@/app/(tenant)/(aux)/avatar';
import { router } from 'expo-router';

export default function Tenants() {
  const user = useAuth();
  const [tenants, setTenants] = useState<TenantsData[] | null>(null);
  const [tenantsProfiles, setTenantsProfiles] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [propertyID, setPropertyID] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [showModal, setShowModal] = useState(false)

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

  const navigateToTenantsList = () => {
    setShowModal(false)
    router.push({pathname: "/TenantsList", params: {propertyID}})
  }

  return (
    <TouchableWithoutFeedback 
    onPress={() => Keyboard.dismiss()}
    className='bg-gray-500 flex-1'>
    <SafeAreaView className='flex-1'>

      {showModal && (
        <View className='bg-gray-50 border border-gray-200 h-60 w-80 items-center justify-center rounded-md absolute self-center top-64 z-10'>
        <Pressable 
        onPress={() => setShowModal(false)}
        className='absolute top-3 right-3'>
          <Ionicons name='close' size={20} color={"#444"}/>
        </Pressable>
        <Text className='text-center font-medium mb-4 text-lg'>Add New Tenants</Text>
        <View className='overflow-hidden rounded-md w-60 mb-4'>
          <Pressable
          onPress={navigateToTenantsList}
          android_ripple={{color: 'white'}}
          style={{backgroundColor: "#444"}} 
          className='p-3 rounded-md'>
            <Text className='text-white text-center'>Select from Existing Tenants</Text>
          </Pressable>
        </View>

        <View className='overflow-hidden rounded-md w-60'>
          <Pressable
          android_ripple={{color: '#444'}}
          className='p-3 rounded-md border border-gray-700'>
            <Text className='text-center'>Add New Tenant</Text>
          </Pressable>
        </View>
        </View>
      )}
     
      
      <View className={`${showModal ? ('opacity-20') : ('')} p-5`}>
        <View className='mb-4 flex-row items-center justify-between'>
          <Text className='font-semibold text-xl'>Manage your Tenants</Text>
          <Pressable 
          style={{backgroundColor: "#444"}}
          onPress={() => setShowModal(!showModal)}
          android_ripple={{color: "white"}}
          className='p-3 rounded-md'>
            <Ionicons name='person-add' color={"white"} size={20}/>
          </Pressable>
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

        {loading ? (
          <View className='gap-y-2 mt-2'>
            {[...Array(1)].map((_, index) => (
             <SkeletonComponent key={index}/>
            ))}
          </View>
        ) : (
          <View className='gap-y-2 mt-2'>
            {tenants && tenants.length !== 0 ? (
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
            ) : (
              <View className='text-xs'>
                <Text>No tenants have been added to the property.</Text>
                <View className='mt-4'>
                  <Text>To add new tenants, follow the steps provided:</Text>
                  <Text className='mt-2'>1. Select the Add Tenant Icon above</Text>
                  <Text className='mt-2'>2. Select between <Text className='font-medium uppercase'>Select from existing tenants</Text> or <Text className='font-medium uppercase'>Add new tenants</Text>.</Text>

                  <Text className='mt-4 italic'><Text className='font-medium uppercase bg-gray-800 text-white'>Select from existing tenants</Text> shows a list of registered tenants in the app.</Text>
                  
                  <Text className='mt-4 italic'><Text className='font-medium uppercase bg-gray-800 text-white'>Add new tenants</Text> allows you to add individuals who are currently boarding in your property but are not yet registered in the app.</Text>
                </View>
              </View>
            )}
            
          </View>
        )}

          
      </View>
      
    </SafeAreaView>
  </TouchableWithoutFeedback>
  );
}
