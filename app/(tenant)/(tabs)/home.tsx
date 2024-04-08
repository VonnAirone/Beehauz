import { fetchPopularNowList } from '@/api/DataFetching';
import { getPermissions } from '@/api/Location';
import { LocationData } from '@/api/Properties';
import { PopularNow, PropertyList } from '@/app/(tenant)/(aux)/homecomponents';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCheapProperties, fetchNearbyMe } from '../(aux)/Filters';
import { usePushNotifications } from '@/api/usePushNotification';
import { supabase } from '@/utils/supabase';

export default function HomePage() {
  const { expoPushToken } = usePushNotifications()

  const [PopularList, setPopularList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [NearbyProperties, setNearbyProperties] = useState([])
  const [cheapProperties, setCheapProperties] = useState([])

  async function subscribeToPropertyChanges() {
    const channels = supabase
      .channel('property-creation')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property' },
        (payload) => {
          fetchData()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  async function fetchData() {
    try {
      const PopularList = await fetchPopularNowList();
      setPopularList(PopularList);
      const data = await getPermissions();
      if (data) {
        await fetchCheapProperties(setCheapProperties)
        setLocation(data)
      }

      if (location) {
        await fetchNearbyMe(location?.latitude, location?.longitude, setNearbyProperties)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  
  useEffect(() => {
    getPermissions()
    fetchData();
    subscribeToPropertyChanges();
  }, []);

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView 
      showsVerticalScrollIndicator={false}
      className='flex-1'>
    { loading ? (
      <View></View>
    ) : (  
    <> 
      <View>
        <View
        style={{backgroundColor: "#444"}}
        className='py-5'>
          <View          
          className='h-18 justify-center p-4'>
            <View className='flex-row items-center'>
              <Image className='w-10 h-10' source={require("@/assets/images/icon.png")}/>
              <Text className='font-semibold text-2xl text-white'>BEEHAUZ</Text>
            </View>
          </View>

          <View className='flex-row items-center px-5'>
            <Pressable 
            className='grow'
            onPress={() => router.push("/Searchpage")}>    
              <View className='flex-row items-center bg-white rounded-md p-2'>
                <View className='mx-2'>
                  <Ionicons 
                  color={"#444"}
                  name='search' 
                  size={20}/>
                </View>
                <TextInput
                editable={false} 
                placeholder='Search for a place'/>
              </View>
            </Pressable>
            <View className='ml-3'>
              <TouchableOpacity onPress={() => router.push("/Bookmarked")}>
                <Ionicons name='bookmark' size={36} color={"white"}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        

        <View className='p-5'>
          <View>
            <Text className='font-semibold text-lg'>POPULAR NOW</Text>
            <View className='mt-4'>
              <PopularNow 
              data={PopularList}/>
            </View>
          </View>

          <View className='my-5'>
            <View className='border rounded-md'>
              <Image
              className='h-48 w-80 rounded-md'
              source={require("@/assets/images/Map Illustration.jpg")}/>
              <View className='absolute overflow-hidden rounded-md bottom-4 left-3'>
                <Pressable 
                onPress={() => router.replace("/(tenant)/(tabs)/map")}
                android_ripple={{color: "white"}}
                style={{backgroundColor: "#444"}}
                className='rounded-md p-3 flex-row items-center'>
                  <Text className='text-white mr-2'>
                    Find through the map
                  </Text>
                  <Ionicons name='arrow-forward-outline' color={'white'}/>
                </Pressable>
              </View>
            </View>
          </View>

          


          <View className='mt-5'>
            <View>
              <Text className='font-semibold text-lg'>NEARBY ME</Text>
              <Text className='text-xs'>Current Location: ({location?.latitude}, {location?.longitude})</Text>
            </View>

            <View className='mt-4'>
              {NearbyProperties.length === 0 ? (
                <View className='h-48 bg-gray-200 rounded-md items-center justify-center'>
                  <Text>No Properties Nearby</Text>
                </View>
              ) : (
                <PropertyList data={NearbyProperties}/>
              )}
            </View>
          </View>

          <View className='mt-5'>
            <View>
              <Text className='font-semibold text-lg'>BEST OFFERS</Text>
            </View>

            <View className='mt-4'>
                <PropertyList data={cheapProperties}/>
            </View>
          </View>

        </View>


      </View>
    </> 
    )}
    </ScrollView>
  </SafeAreaView> 

  );
}
