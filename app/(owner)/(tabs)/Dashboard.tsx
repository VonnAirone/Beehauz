import { Pressable, ScrollView, Text, View, Image} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '@/components/logo'
import { useAuth } from '@/utils/AuthProvider'
import { getProfile } from '@/api/DataFetching'
import { PropertyData, ReviewData, TenantsData, UserData } from '@/api/Properties'
import { supabase } from '@/utils/supabase'
import { DashboardComponents, PropertyReviews } from '../(aux)/propertycomponents'
import { Ionicons } from '@expo/vector-icons'
import MapView, { Callout, Marker, MarkerAnimated } from 'react-native-maps'

export default function Dashboard() {
  const session = useAuth()
  const user = session?.session?.user?.id;
  const [userProfile, setUserProfile] = useState<UserData | null>(null)
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [tenants, setTenants] = useState<TenantsData[] | null>(null);
  const [bookings, setBookings] = useState(null)
  const [propertyID, setPropertyID] = useState(0)
  const [loading, setLoading] = useState(true)
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);
  const [latitude, setLatitude] = useState(() => undefined);
  const [longitude, setLongitude] = useState(() => undefined);
  const [markerPosition, setMarkerPosition] = useState({ latitude: 10.7913309, longitude: 122.0068165 });
  

  async function subscribeToBookingChanges() {
    const channels = supabase
      .channel('realtime-booking-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Change received!', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }

  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await getUserProfile(user);
      await getProperties();

      if (propertyID !== null) {
          await getPropertyReviews();
          await getTenants();
          await fetchBookings();
      }
      
      setLoading(false)
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
      .select()
      .eq("owner_id", user)
      
      
      if (error) {
        console.log("Error fetching properties: ", error.message)
        return;
      }

      if (data && data.length > 0) {
        setProperties(data);
        setPropertyID(data[0]?.property_id);
        setLatitude(data[0]?.latitude);
        setLongitude(data[0]?.longitude);
        
      }
    } catch (error) {
      console.log("Error fetching properties: ", error.message)
    }
  }
  
  async function getPropertyReviews() {
    try {
        const { data, error } = await supabase
            .from("property_reviews")
            .select("*")
            .eq('property_id', propertyID);

        if (error) {
            console.log("Error fetching property reviews: ", error.message);
            return null;
        }

        if (data) {
            setPropertyReviews(data);
        } else {
            console.log("No property reviews found.");
        }
    } catch (error) {
        console.log("Error fetching property reviews: ", error.message);
        return null;
    }
}

async function subscribeToPropertyChanges() {
  const channels = supabase
    .channel('property-creation')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'property' },
      (payload) => {
        console.log('Change received!', payload);
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
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq("property_id", propertyID)

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
    <SafeAreaView className='flex-1 p-3'>
      {loading ? (
        <View></View>
      ): (
        <>
          <View className='flex-row items-center justify-between'>
            <Logo/>
            <Pressable className='p-3 bg-yellow rounded-md'>
              <Ionicons name='notifications' color={"#444"} size={20}/>
            </Pressable>
          </View>

            <ScrollView className='p-5'>
            <Text className='text-2xl'>Hello <Text className='font-semibold'>{userProfile?.first_name}</Text></Text>

            <View className='mb-4'>
              <Text className='text-xs'>This is what we have for you today.</Text>
            </View>

            <DashboardComponents id={user} properties={properties} tenants={tenants} bookings={bookings}/>

            <View className='mt-10 mb-2'>
              <Text className='font-semibold'>{properties[0]?.name} is located here: </Text>
            </View>
          
            <View className='rounded-md'>
              <MapView 
              scrollEnabled={false}
              style={{borderRadius: 20}}
              className='h-48 w-full rounded-md'
              initialRegion={{
                latitude: 10.7913309,
                longitude: 122.0068165,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
              }}>
                <MarkerAnimated
                coordinate={markerPosition}>
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
          
        </ScrollView> 
      </> 
      )}
       
    </SafeAreaView>
  )
}

