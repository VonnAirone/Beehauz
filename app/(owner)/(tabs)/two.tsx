import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ScrollView, Pressable, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/utils/AuthProvider';
import { supabase } from '@/utils/supabase';
import { PropertyData, PropertyTerms, ReviewData } from '@/app/api/Properties';
import { Images } from '@/app/(tenant)/(aux)/homecomponents';
import { loadImages } from '@/app/api/ImageFetching';
import { fetchAmenities, fetchPropertyTerms, getPropertyReviews } from '@/app/api/DataFetching';
import { PropertyReviews } from '../(aux)/propertycomponents';
import { router } from 'expo-router';
import LoadingComponent from '@/app/components/LoadingComponent';


export default function BHDetails() {
  const user = useAuth()?.session.user;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyData | null>(null);
  const [propertyID, setPropertyID] = useState(0)
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);
  const [ratings, setRatings] = useState(0)
  const [terms, setTerms] = useState<PropertyTerms | null>(null)
  const [amenities, setAmenities] = useState([])

  useEffect(() => {
    
    fetchData()
    subscribeToTermsChanges()
    subscribeToPropertyChanges()
  }, []);


  
  async function fetchData() {
    await getProperties();

    setLoading(false)
  }

  const fetchPropertyReviews = async () => {
    try {
      const reviews = await getPropertyReviews(propertyID);
      setPropertyReviews(reviews);
      const allRatings = reviews.map((review) => review.rating);
      const totalRating = allRatings.reduce((acc, rating) => acc + rating, 0);
      setRatings(totalRating);
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      setPropertyReviews(null);
    }
  };

  async function subscribeToTermsChanges() {
    const channels = supabase
      .channel('property-creation')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_terms' },
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

  async function getProperties() {
    try {
      const { data, error } = await supabase
        .from("property")
        .select()
        .eq("owner_id", user?.id);
        
      if (error) {
        console.log("Error fetching properties: ", error.message);
        return;
      }
  
      if (data && data.length > 0) {
        const property = data[0];
        setProperties(property);
        await setPropertyID(property?.property_id);
        if (property?.property_id) {
          await loadImages(property?.property_id, setImages);
          await fetchPropertyReviews();
          await fetchPropertyTerms(property?.property_id, setTerms);
          await fetchAmenities(property?.property_id, setAmenities);
        }
      }
    } catch (error) {
      console.log("Error fetching properties: ", error.message);
    }
  }
  
  

  return (
  <SafeAreaView className='flex-1 bg-white'>
  {loading ? (
    <LoadingComponent/>
  ) : (
    <>
      {properties ? (
      <ScrollView showsVerticalScrollIndicator={false}> 
        <View className='overflow-hidden rounded-full absolute z-10 right-3 top-3'>
          <Pressable 
          onPress={() => router.push({pathname: "/ManageProperty", params: {propertyID}})}
          android_ripple={{color: '#444'}}
          className='p-5 bg-white rounded-full w-16 h-16 items-center justify-center'>
            <Ionicons name='build' size={20} color={'#444'}/>
          </Pressable>
        </View>
        <View>
          {images?.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => 
              <View className='w-screen h-72'> 
                <Pressable>
                  <Images item={{...item, propertyID}} />
                </Pressable>
              </View>}
              initialNumToRender={4}
              maxToRenderPerBatch={5}
              windowSize={7}
            />
          ) : (
            <View className='h-72 w-screen bg-gray-200'/>
          )}

          <View className='p-5'>
            <View className='flex-row items-center justify-between'>
              <Text className='font-semibold text-lg'>{properties?.name}</Text>
              <Text className='font-medium'>{properties?.price ? properties?.price : 'N/A'} / month</Text>
            </View>

            <View>
              <TouchableOpacity 
              className='flex-row items-center gap-x-1'>
                <Ionicons name='location' size={15} color={'#444'}/>
                <Text>{properties?.address}</Text>
              </TouchableOpacity>
            </View>
            

            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='star' size={15} color={'#444'}/>
              <Text><Text className='font-medium'>{ratings}</Text> stars / <Text className='font-medium'>{propertyReviews?.length}</Text> {propertyReviews?.length > 0 ? 'review' : 'reviews'}</Text>
            </View>

            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='bed' color={"#444"} size={15}/>
              <Text><Text className='font-medium'>{properties?.available_beds} </Text>beds available</Text>
            </View>

            <View className='mt-5 flex-row items-center'>
              <Text className='font-medium'>Reservation Fee:</Text>
              <Text> {properties?.reservation_fee}</Text>
            </View>
            
            <View className='mt-3'>
              <View className='flex-row items-center gap-x-1'>
                <Text className='font-semibold'>Description</Text>
              </View>
              <View className='mt-2'>
                {properties?.description ? (
                  <Text>
                    {properties?.description}
                  </Text>
                ): (
                  <Text>
                    No description
                  </Text>
                )}
              </View>
            </View>

            <View className='mt-3'>
              <Text className='font-semibold'>Payment Terms</Text>
              
              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Advance Payment: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.advance_payment : 'Not specified'}</Text>
              </View>

              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Security Deposit: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.security_deposit : 'Not specified'}</Text>
              </View>

              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Electricity Bill: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.electricity_bill : 'Not specified'}</Text>
              </View>

              <View className='flex-row items-end mt-1'>
                <Text className='text-xs'>Water Bill: </Text>
                <Text className='font-semibold text-xs'>{terms ? terms?.water_bills : 'Not specified'}</Text>
              </View>
            </View>

            <View className='mt-5'>
              <View className='flex-row items-center'>
                <Text className='font-semibold mr-1'>Amenities</Text>  
              </View>
              
              <View className='mt-2'>
                <FlatList 
                data={properties?.amenities} 
                showsHorizontalScrollIndicator={false} horizontal={true} 
                renderItem={({item,index}) =>
                  <View className='mr-2'>
                    <View key={item} className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                        <Text className='text-center text-xs'>{item}</Text>
                    </View>
                  </View>
                }/>
              </View>
              
            </View>
            
            <View className='mt-5'>
              <Text className='font-semibold'>Reviews ({propertyReviews?.length})</Text>
              <Text className='italic text-xs mt-1'>Note: Only previous tenants and currently boarding are allowed to leave reviews for the property.</Text>
              
              <View className='mt-2'>
                <PropertyReviews reviews={propertyReviews}/>
              </View>
              
            </View>
          </View>
        </View>
        
      </ScrollView>
      ) : (
        <View className='p-5 items-center justify-center flex-1'>
          <Text>No  Property Created</Text>
        </View>
      )}
        
    </>
    )}
  </SafeAreaView>
  );
}
