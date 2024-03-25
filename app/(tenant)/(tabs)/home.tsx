import { fetchPopularNowList } from '@/api/DataFetching';
import { getPermissions } from '@/api/Location';
import { LocationData, PropertyData } from '@/api/Properties';
import { PopularNow, PropertyList, Services } from '@/app/(tenant)/(aux)/homecomponents';
import Logo from '@/components/logo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native'; // Rename the component to avoid conflict
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNearbyMe } from '../(aux)/Filters';

export default function HomePage() {
  const [PopularList, setPopularList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [NearbyProperties, setNearbyProperties] = useState([])
  
  useEffect(() => {
    async function fetchData() {
      try {
        const PopularList = await fetchPopularNowList();
        setPopularList(PopularList);
        const data = await getPermissions();
        if (data) {
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
    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView 
      showsVerticalScrollIndicator={false}
      className='flex-1'>
    { loading ? (
      <View></View>
    ) : (  
    <> 
      <View>
        <View className='bg-yellow p-5'>
          <View className='items-start'>
            <View className='flex-row items-center p-2 justify-center' >
              <Image className='w-10 h-10' source={require("@/assets/images/icon.png")}/>
              <Text className='text-xl font-semibold pr-2 text-white'>BEEHAUZ</Text>
            </View>
          </View>

          <View className='flex-row items-center'>
            <Pressable 
            className='grow'
            onPress={() => router.push("/Searchpage")}>    
              <View className='flex-row items-center bg-white rounded-md p-2'>
                <View className='mx-2'>
                  <Ionicons 
                  name='search' 
                  size={20}
                  color={"#ffa233"}/>
                </View>
                <TextInput 
                editable={false} 
                placeholder='Search for a place'/>
              </View>
            </Pressable>
            <View className='ml-3'>
              <TouchableOpacity onPress={() => router.push("/Bookmarked")}>
                <Ionicons name='bookmark' size={32} color={"white"}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        

        <View className='p-5'>
          <View>
            <Text className='font-semibold'>SERVICES</Text>
            <View className='mt-2'>
              <Services/>
            </View>
          </View>

          <View className='mt-5'>
            <Text className='font-semibold'>POPULAR NOW</Text>
            <View className='mt-4'>
              <PopularNow 
              data={PopularList}/>
            </View>
          </View>

          <View className='my-5'>
            <View className='rounded-md'>
              <Image
              className='h-48 w-full rounded-md'
              source={require("@/assets/images/Map Illustration.jpg")}/>
              <View className='absolute overflow-hidden rounded-md bottom-4 left-3'>
                <Pressable className='bg-yellow rounded-md p-3 flex-row items-center gap-x-2'>
                  <Text className='text-white'>
                    Find through the map
                  </Text>
                  <Ionicons name='arrow-forward-outline' color={'white'}/>
                </Pressable>
              </View>

            </View>
          </View>


          <View className='mt-5'>
            <View>
              <Text className='font-semibold'>NEARBY ME</Text>
              <Text className='text-xs'>Current Location: ({location?.latitude}, {location?.longitude})</Text>
            </View>

            <View className='mt-4'>
              {NearbyProperties.length === 0 ? (
                <View>
                  <Text>No Properties Nearby</Text>
                </View>
              ) : (
                <PropertyList data={NearbyProperties}/>
              )}
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
