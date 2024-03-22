import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ScrollView, Pressable, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/utils/AuthProvider';
import { supabase } from '@/utils/supabase';
import { PropertyData, ReviewData } from '@/api/Properties';
import { Images } from '@/app/(tenant)/(aux)/homecomponents';
import { loadImages } from '@/api/ImageFetching';
import { getPropertyReviews } from '@/api/DataFetching';
import { PropertyReviews } from '../(aux)/propertycomponents';
import { router } from 'expo-router';
import { Amenities } from '@/app/(tenant)/(aux)/detailscomponent';


export default function BHDetails() {
  const user = useAuth()?.session.user;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [properties, setProperties] = useState<PropertyData | null>(null);
  const [propertyID, setPropertyID] = useState(0)
  const [propertyReviews, setPropertyReviews] = useState<ReviewData[] | null>(null);
  const [ratings, setRatings] = useState(0)

  const openImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true)
  }

  useEffect(() => {
    getProperties()
    fetchPropertyReviews()
  }, [propertyID]);


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

    setLoading(false)
  };

  async function getProperties() {
    try {
      const { data, error } = await supabase.from("property")
      .select()
      .eq("owner_id", user?.id)
      
      
      if (error) {
        console.log("Error fetching properties: ", error.message)
        return;
      }
  
      if (data && data.length > 0) {
        setProperties(data[0]);
        setPropertyID(data[0]?.property_id);
        await loadImages(propertyID, setImages);
      }
    } catch (error) {
      console.log("Error fetching properties: ", error.message)
    }
  }
  

  return (
    <SafeAreaView className='flex-1 bg-white'>



      {loading ? (
        <View className='flex-1 justify-center items-center'>
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView> 
        <View className='overflow-hidden rounded-full absolute z-10 right-5 top-5'>
          <Pressable 
          onPress={() => router.push("/ManageProperty")}
          android_ripple={{color: '#ffa233'}}
          className='p-5 bg-white rounded-full w-16 h-16 items-center justify-center'>
            <Ionicons name='build' size={20} color={'#ffa233'}/>
          </Pressable>
        </View>
        <View>
          {images.length > 0 ? (
            <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => 
              <View className='w-screen h-72'> 
                <Pressable onPress={() => openImage(item)}>
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

            <View>
              <Text className='font-semibold text-lg'>{properties?.name}</Text>
            </View>

            <View>
              <TouchableOpacity 
              // onPress={() => router.push({pathname: "/MapView", params: {latitude: properties?.latitude, longitude: properties?.longitude}})}

              className='flex-row items-center gap-x-1'>
                <Ionicons name='location' size={15} color={'#FF8B00'}/>
                <Text>{properties?.address}</Text>
              </TouchableOpacity>
            </View>

            <View className='flex-row items-center gap-x-1'>
              <Ionicons name='star' size={15} color={'#FF8B00'}/>
              <Text> <Text className='font-semibold'>{ratings}</Text> stars / <Text className='font-semibold'>{propertyReviews.length}</Text> {propertyReviews.length > 0 ? 'review' : 'reviews'}</Text>
            </View>
            
            <View className='mt-5'>
              <View className='flex-row items-center gap-x-1'>
                <Text className='text-lg font-semibold'>Description</Text>
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

            <View className='mt-5'>
              <View className='flex-row items-center'>
                <Text className='text-lg font-semibold mr-1'>Amenities</Text>  
              </View>
              <Amenities propertyID={propertyID}/>
            </View>
            
            <View className='mt-5'>
              <Text className='text-lg font-semibold'>Reviews</Text>

              <PropertyReviews reviews={propertyReviews}/>
            </View>

            


          </View>
        </View>
        
      </ScrollView>
      )}

     
    </SafeAreaView>
  );
}
