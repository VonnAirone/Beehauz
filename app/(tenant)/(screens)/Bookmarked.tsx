import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/back-button';
import { useAuth } from '@/utils/AuthProvider';
import { useQuery } from 'react-query';
import { fetchFavorites } from '@/api/DataFetching';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons'; // Assuming you have Ionicons imported
import { SingleImageDisplay } from '../(aux)/homecomponents';

export default function Bookmarked() {
  const user = useAuth();

  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { data: properties = [], isLoading, isError, refetch } = useQuery(
    ['savedProperties', user],
    async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select("*")
        .eq('tenant_id', user?.session.user.id);

      if (error) {
        throw new Error('Error fetching saved properties');
      }

      if (data) {
        const propertyPromises = data.map(async (property) => {
          return await fetchFavorites(property.property_id);
        });
        const fetchedProperties = await Promise.all(propertyPromises);
        return fetchedProperties.flat();
      }

      return [];
    }
  );

  useEffect(() => {
    subscribeToChanges()
    
  }, []);

  async function subscribeToChanges() {
    const channels = supabase
      .channel('favorites-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'favorites' },
        (payload) => {
          console.log('Change received!', payload);
          refetch()
        }
      )
      .subscribe();
  
    return () => {
      channels.unsubscribe();
    };
  }

  const handleCardPress = (propertyId) => {
    // Define your handleCardPress function logic here
  };

  const renderItem = ({ item, index }) => (
    <Pressable onPress={() => handleCardPress(item.property_id)} className='overflow-hidden'>
      <View>
        <View className='h-40 w-80'>
          <SingleImageDisplay propertyID={item.property_id}/>
        </View>

        <View className="mt-2">
          <View className="flex-row items-end justify-between">
            <Text className='font-semibold text-xl'>{item.name}</Text>
            <Text className="font-semibold">{item.price} / month</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="location" color={'#444'}/>
            <Text>{item.address}</Text>
          </View>

          <View className="flex-row items-center gap-x-1">
            <Ionicons name="bed-outline" size={15}/>
            <Text>{item.available_beds} Beds</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>Error fetching saved properties</Text>;
  }

  return (
    <SafeAreaView className='flex-1'>
       <View className='p-5'>
        <BackButton/>
          <View className='p-3'>
            <Text className='font-semibold'>List of Saved Properties</Text>
          </View>
          {properties && properties?.length !== 0 ? (
            <FlatList 
              contentContainerStyle={{alignItems: 'center'}}
              data={properties} 
              renderItem={renderItem} 
              showsHorizontalScrollIndicator={false} 
              horizontal={false} 
            />
          ) : (
            <View className='h-20 justify-center'>
              <Text className='text-center'>No saved properties as of the moment</Text>
            </View>
          )}
      </View>
    </SafeAreaView>
  );
}

