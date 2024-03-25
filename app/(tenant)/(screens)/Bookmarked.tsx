import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/components/back-button'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/utils/AuthProvider'
import { fetchFavorites } from '@/api/DataFetching'
import { Favorites } from '../(aux)/homecomponents'

export default function Bookmarked() {
  const user = useAuth();
  const [properties, setProperties] = useState([])

  async function fetchSavedProperties() {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select("*")
        .eq('tenant_id', user?.session.user.id);
  
      if (data) {
        const propertyPromises = data.map(async (property) => {
          return await fetchFavorites(property.property_id);
        });
        const fetchedProperties = await Promise.all(propertyPromises);
        setProperties(fetchedProperties.flat());
      }
    } catch (error) {
      console.log("Error fetching saved properties: ", error.message);
    }
  }
  
  
  

  useEffect(() => {
    fetchSavedProperties()
  }, [user])
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <BackButton/>
        <View className='p-3'>
          <Text className='font-semibold'>List of Saved Properties</Text>
        </View>

        <View>
          <Favorites data={properties}/>
        </View>
      </View>
    </SafeAreaView>
  )
}