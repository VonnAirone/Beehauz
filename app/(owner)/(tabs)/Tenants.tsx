import { Alert, FlatList, Keyboard, Pressable, Text, TextInput, View, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { TenantsData, UserData } from '@/app/api/Properties';
import { getProfile } from '@/app/api/DataFetching';
import { useAuth } from '@/utils/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import { router } from 'expo-router';
import moment from 'moment';
import AvatarImage from '../../(tenant)/(aux)/avatar';

export default function Tenants() {
  const user = useAuth();
  const [tenants, setTenants] = useState([]);
  const [tenantsProfiles, setTenantsProfiles] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [propertyID, setPropertyID] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [showModal, setShowModal] = useState(false)

  const formatDate = (date) => {
    return moment(date).format('MMMM YYYY');
  };

  async function getTenants() {
    try {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("property_id", propertyID);

        if (error) {
            console.log("Error fetching tenants: ", error.message);
            return null;
        } else if (data.length === 0) {
            return null;
        } else {
            setTenants(data);
            fetchTenantsProfiles(data);
        }
    } catch (error) {
        console.log("Error fetching tenants: ", error.message);
        return null;
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
    } else {
      return null;
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        await getProperties();
        await getTenants();
      } catch (error) {
        console.log("Error fetching data: ", error.message);
      } finally {
        setLoading(false)
      }
    }

    async function subscribeToChanges() {
      const channels = supabase
        .channel('tenants-update')
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
  
    fetchData();
    subscribeToChanges();
  }, [propertyID]);
  

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

  const navigateToTenantsList = () => {
    setShowModal(false)
    router.push({pathname: "/(owner)/(screens)/TenantsList", params: {propertyID}})
  }

  return (
    <TouchableWithoutFeedback 
    onPress={() => Keyboard.dismiss()}
    className='flex-1'>
    <SafeAreaView className='flex-1'>

      {showModal && (
        <View className='bg-white border border-gray-200 h-60 w-80 items-center justify-center rounded-md absolute self-center top-64 z-10'>
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
            <Text className='text-white text-center'>Select from Approved Tenants</Text>
          </Pressable>
        </View>

        <View className='overflow-hidden rounded-md w-60'>
          <Pressable
          onPress={() => {setShowModal(false), router.push({pathname: '/(owner)/(screens)/Reservations', params: {propertyID}})}}
          android_ripple={{color: '#444'}}
          className='p-3 rounded-md border border-gray-700'>
            <Text className='text-center'>View Reservations</Text>
          </Pressable>
        </View>
        </View>
      )}
     
      
      <View className={`${showModal ? ('opacity-20') : ('')} p-5`}>
        <View className='mb-4'>
          <Text className='font-semibold text-xl'>Manage your Tenants</Text>
        </View>

        <View className='flex-row items-center gap-x-2'>
          <View className='flex-row grow items-center bg-white rounded-md p-2 backdrop-blur-3xl'>
            <View className='mx-2'>
              <Ionicons name='search' size={20} color={'#444'}/>
            </View>
            <TextInput
              placeholder='Search for a user'
              value={searchQuery}
              onChangeText={handleOnChangeText}
            />
          </View>
          <View className='rounded-md overflow-hidden'>
            <Pressable 
              onPress={() => setShowModal(!showModal)}
              style={{backgroundColor: "#444"}}
              android_ripple={{color: "white"}}
              className='p-3 rounded-md '>
              <Ionicons name='person-add' color={"white"} size={20}/>
            </Pressable>
          </View>
          
        </View>
        {loading ? (
          <View>
          </View>
        ) : (
          <View className='gap-y-2 mt-2'>
            <FlatList
              data={searchQuery ? searchResults : tenantsProfiles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View key={index} className="overflow-hidden rounded-md mb-4">
                  <Pressable
                    onPress={() => router.push({pathname: "/(owner)/(screens)/TenantProfile", params: {tenant_id: tenantsProfiles[index].id, status: tenants[index].status}})}
                    android_ripple={{ color: "#444" }}
                    className="p-4 bg-white rounded-md"
                  >
                    <View className='flex-row justify-between items-center'>
                      <View className='flex-row items-center gap-x-2'>
                        <View className='h-12 w-12'>
                          <AvatarImage userID={tenants[index].tenant_id} />
                        </View>
                        <View>
                          <Text>{item.first_name}</Text>
                          <Text className='text-xs'>Joined last
                            <Text className='font-medium'> {formatDate(item?.date_joined)}</Text>
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-x-1">
                        <Ionicons
                          name='ellipse'
                          color={
                            tenants &&
                            tenants[index].status === "Boarding"
                              ? "green"
                              : tenants[index].status === "Request To Leave"
                              ? "red"
                              : ""
                          }/>
                        <Text className='text-xs w-20 text-start'>{tenants && tenants[index].status}</Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              )}
            />
          </View>
        )}
      
          
        
          {tenants?.length === 0 && (
            <View className='text-xs mt-2'>
              <Text className='text-center'>No tenants have been added to the property.</Text>
            </View>
          )}
            
        
      
       



          
      </View>
      
    </SafeAreaView>
  </TouchableWithoutFeedback>
  );
}
