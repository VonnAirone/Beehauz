import { ScrollView, Text, View, Image } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/utils/AuthProvider'
import { getProfile } from '@/app/api/DataFetching'
import { PropertyData, TenantsData, UserData } from '@/app/api/Properties'
import { supabase } from '@/utils/supabase'
import { DashboardComponents } from '../(aux)/propertycomponents'
import MapView, { Callout, MarkerAnimated } from 'react-native-maps'
import { usePushNotifications } from '@/app/api/usePushNotification'

export default function Dashboard() {
  const session = useAuth()
  const user = session?.session?.user?.id;
  let expoPushToken = usePushNotifications(user);
  const [userProfile, setUserProfile] = useState<UserData | null>(null)
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [tenants, setTenants] = useState<TenantsData[] | null>(null);
  const [bookings, setBookings] = useState(null)
  const [propertyID, setPropertyID] = useState(0)
  const [loading, setLoading] = useState(true)
  const [latitude, setLatitude] = useState(() => undefined);
  const [longitude, setLongitude] = useState(() => undefined);
  const [ownerStatus, setOwnerStatus] = useState(false)

  async function subscribeToBookingChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }

  async function getStatus() {
    try {
      const {data, error} = await supabase
      .from('owners')
      .select('*')
      .eq('owner_id', user)
      .single();

      if (data) {
        setOwnerStatus(data?.status)
      }
    } catch (error) {
      console.log("Error fetching owner status: ", error.message)
    }
  }
  

  useEffect(() => {
      async function fetchData() {
          try {
              setLoading(true);
              await Promise.all([
                getUserProfile(user),
                getProperties(),
                getTenants(),
                fetchBookings(),
                getStatus()
              ])
          } catch (error) {
              console.log("Error fetching data: ", error.message);
          } finally {
              setLoading(false);
          }
      }

      fetchData();
      subscribeToPropertyChanges();
      subscribeToBookingChanges();
  }, [propertyID]);

  async function getUserProfile(id: string) {
    try {
        const data = await getProfile(user);
        setUserProfile(data);
    } catch (error) {
        console.log("Error fetching owner", error.message);
        throw error;
    }
  }

  async function getProperties() {
    try {
      const { data, error } = await supabase.from("property")
      .select('*')
      .eq("owner_id", user)
      
      
      if (error) {
        console.log("Error fetching properties: ", error.message)
        return;
      }

      if (data && data.length > 0) {
        setProperties(data);
        setPropertyID(data[0]?.property_id);
        const latitudeFloat = parseFloat(data[0]?.latitude)
        const longitudeFloat = parseFloat(data[0]?.longitude)
        setLatitude(latitudeFloat)
        setLongitude(longitudeFloat)
        
      }
    } catch (error) {
      console.log("Error fetching properties: ", error.message)
    }
  }

async function subscribeToPropertyChanges() {
  const channels = supabase
    .channel('property-creation')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'property' },
      (payload) => {
        getProperties()
      }
    )
    .subscribe();

  return () => {
    channels.unsubscribe();
  };
}

  async function getTenants() {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("property_id", propertyID);

      if (error) {
        console.log("Error fetching tenants: ", error.message);
      } 

      if (data) {
        setTenants(data)
      }
    } catch (error) {
      console.log("Error fetching tenants: ", error.message);
    }
  }

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq("property_id", propertyID)
        .eq("status", "Pending")

      if (error) {
        console.error('Error fetching bookings:', error.message);
        return;
      }

      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
    } 
  };


  return (
    <SafeAreaView className='flex-1'>
      {loading ? (
        <View></View>
      ): (
        <>
          <View 
          style={{backgroundColor: "#444"}}>
            <View className='p-5 flex-row items-center justify-between'>
              <View className='flex-row items-center justify-center' >
                <Image className='w-10 h-10' source={require("@/assets/images/icon.png")}/>
                <Text className='text-xl text-white font-semibold pr-2'>BEEHAUZ for Owners</Text>
              </View>
              {/* <Pressable
                onPress={() => {
                    router.push({ pathname: "/(owner)/(screens)/Notifications", params: { propertyID } });
                    setNotificationsViewed(true);}}
                className='bg-yellow rounded-md'>
                <Ionicons name='notifications' color={"white"} size={30} />
                {!notificationsViewed && bookings && bookings.length > 0 && (
                    <View className="absolute inline-flex items-center justify-center w-3 h-3 font-bold text-white bg-red-500 rounded-full right-0"></View>
                )}
              </Pressable> */}

            </View>

          </View>

            <ScrollView className='p-5'>
            <Text className='text-2xl'>Hello <Text className='font-semibold'>{userProfile?.first_name}</Text></Text>

            <View className='mb-4'>
              <Text className='text-xs'>This is what we have for you today.</Text>
            </View>

            <DashboardComponents ownerStatus={ownerStatus} id={user} properties={properties} tenants={tenants} bookings={bookings}/>

            {/* <View className='mt-10 mb-2'>
              <Text className='font-semibold'>{properties ? properties[0]?.name : 'No property created'}</Text>
            </View> */}
          
            {properties && properties?.length !== 0 ? (
              <>
              <View className='mt-10 mb-2'>
                <Text className='font-semibold'>
                  {properties ? `${properties[0]?.name} is located here` : 'No property created'}
                  </Text>
              </View>
          
              <View className='rounded-md'>
                <MapView 
                scrollEnabled={true}
                className='h-48 w-full'
                initialRegion={{
                  latitude: latitude,
                  longitude: longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}>
                  <MarkerAnimated
                  coordinate={{latitude: latitude, longitude: longitude}}>
                    <View className='justify-center items-center'>
                      <View 
                      style={{backgroundColor: "#444"}}
                      className='rounded-md p-2'>
                        <Text className='text-center text-white text-xs'>{properties[0]?.name}</Text>
                      </View>
                    
                      <View className='h-12 w-12'>
                        <Image 
                        style={{width: '100%', height: "100%"}}
                        source={require("@/assets/custom-pin.png")}/>
                      </View>
                    </View>
                    
                  
                    
                    <Callout>
                      <View className='w-32 rounded-md'>
                        <Text className='text-center'>{properties[0]?.name}</Text>
                      </View>
                    </Callout>
                  </MarkerAnimated>
                </MapView>   
              </View>
              </>
            ) : (
              <>
              <View className='mt-10 mb-2'>
                <Text className='font-semibold'>{properties ? properties[0]?.name : 'No property created'}</Text>
              </View>
              <MapView 
                scrollEnabled={false}
                style={{borderRadius: 20}}
                className='h-48 w-full rounded-md'
                initialRegion={{
                  latitude: 10.790666,
                  longitude: 122.0052101,
                  latitudeDelta: 0.001,
                  longitudeDelta: 0.001,
                }}>
              </MapView>
              </>
            )}
            
          
        </ScrollView> 
      </> 
      )}
       
    </SafeAreaView>
  )
}

