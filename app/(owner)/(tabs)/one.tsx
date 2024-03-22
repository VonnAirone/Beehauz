import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '@/components/logo'
import { useAuth } from '@/utils/AuthProvider'
import { getProfile } from '@/api/DataFetching'
import { PropertyData, ReviewData, TenantsData, UserData } from '@/api/Properties'
import { supabase } from '@/utils/supabase'
import { HomepageSkeleton } from '../(aux)/SkeletonComponents'
import { DashboardComponents, PropertyReviews } from '../(aux)/propertycomponents'

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
  const hasFetched = useRef(false)

  useEffect(() => {
    async function fetchData() {
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
      <View className='items-start'>
        <Logo/>
      </View>

      {loading ? (
        <HomepageSkeleton/>
      ) : (
        <View className='p-5'>
        <Text className='text-4xl'>Hello <Text>{userProfile?.first_name}</Text></Text>

        <View className='mt-2'>
          <Text>This is what we have for you today.</Text>
        </View>

        <DashboardComponents id={user} properties={properties} tenants={tenants} bookings={bookings}/>

        <View className='mt-8 border-2 border-gray-200'></View>
        
        <View className='mt-3'>
          <Text className='font-semibold'>Property Reviews <Text>({propertyReviews ? propertyReviews.length : "0"})</Text></Text>
        </View>
        <PropertyReviews reviews={propertyReviews}/>
      </View>
      )}

      

    </SafeAreaView>
  )
}

