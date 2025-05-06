import { fetchPopularNowList, fetchPropertyListData } from '@/app/api/DataFetching';
import { PopularNow, PropertyList } from '@/app/(tenant)/(aux)/homecomponents';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCheapProperties, fetchNearbyMe } from '../(aux)/Filters';
import * as Location from 'expo-location';
import { useAuth } from '@/utils/AuthProvider';

export default function HomePage() {
  const userID = useAuth()?.session?.user?.id;
  const [PopularList, setPopularList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [NearbyProperties, setNearbyProperties] = useState([])
  const [cheapProperties, setCheapProperties] = useState([])
  const [currentAddress, setCurrentAddress] = useState('')
  const [refreshing, setRefreshing] = useState(false);

  // async function subscribeToPropertyChanges() {
  //   const channels = supabase
  //     .channel('property-creation')
  //     .on(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'property' },
  //       (payload) => {
  //         fetchData()
  //       }
  //     )
  //     .subscribe();
  
  //   return () => {
  //     channels.unsubscribe();
  //   };
  // }

  const reverseGeocode = async (latitude, longitude) => {
    const reverseGeocodeAddress = await Location.reverseGeocodeAsync(
      {
        latitude: latitude,
        longitude: longitude
      }
    )
   
    if (reverseGeocodeAddress) {
      setCurrentAddress(`${reverseGeocodeAddress[0].city}, ${reverseGeocodeAddress[0].subregion}`)
    }
    
  }

  // async function sendNotif() {
  //   console.log(expoPushToken.data)
  //   if (expoPushToken) {
  //     await sendPushNotification(expoPushToken.data, "Welcome to Beehauz")
  //   } else {
  //     const token = await Notifications.getExpoPushTokenAsync({
  //       projectId: Constants.expoConfig?.extra?.eas.projectId,
  //     });

  //     await sendPushNotification(token.data, "Welcome to Beehauz")
  //   }
    
  // }

  async function fetchData() {
    try {
      const PopularList = await fetchPropertyListData();
      setPopularList(PopularList);
      
      // await fetchCheapProperties(setCheapProperties)

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("Please grant location permissions");
        return;
      } else {
        let currentLocation = await (await Location.getCurrentPositionAsync()).coords;
        await reverseGeocode(currentLocation.latitude, currentLocation?.longitude)
        // await fetchNearbyMe(currentLocation.latitude, currentLocation?.longitude, setNearbyProperties)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
     
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
};

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView 
      refreshControl={
        <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['#444']}
        />
      }
      showsVerticalScrollIndicator={false}
      className='flex-1'>
    { loading ? (
      <View></View>
    ) : (  
    <> 
      <View>

        <View className='flex flex-row justify-between p-5 items-center'>
          <View className='w-60'>
            <Text className='text-2xl'>Find the boarding house that fits your needs.</Text>
          </View>
          
          <View className='ml-3'>
            <TouchableOpacity onPress={() => router.push("/Bookmarked")}>
              <Ionicons name='bookmark' size={30} color={"#ff8b00"}/>
            </TouchableOpacity>
          </View>
        </View>

        <Pressable 
          className='grow px-5'
          onPress={() => router.push("/(tenant)/(screens)/Searchpage")}>    
          <View className='flex-row items-center p-2 border border-gray-200 focus:border-gray-400 rounded-md'>
            <View className='mx-2'>
              <Ionicons 
              color={"#ff8b00"}
              name='search' 
              size={20}/>
            </View>
            <TextInput
            editable={false} 
            placeholder='Search by name or location'/>
          </View>
        </Pressable>
        

        <View className='p-5'>
          <View>
            <Text className='font-semibold text-lg'>POPULAR NOW</Text>
            <View className='mt-4'>
              <PopularNow 
              data={PopularList}/>
            </View>
          </View>

          <View className='mt-5'>
            <View className='border rounded-sm'>
              <View className='h-48 w-72 rounded-md'>
                <Image
                  className='w-full h-full'
                  resizeMode='contain'
                  source={require("@/assets/images/Map Illustration.jpg")}
                />
              </View>

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
              <Text className='text-xs'>Current Location: {currentAddress}</Text>
            </View>

            <View className='mt-4'>
              {NearbyProperties.length === 0 ? (
                <View className='h-48 bg-gray-200 rounded-md items-center justify-center'>
                  <Text>No Properties Nearby</Text>
                </View>
              ) : (
                <></>
                // <PropertyList data={NearbyProperties}/>
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
