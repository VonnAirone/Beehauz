import React, { useEffect, useState, useRef } from 'react';
import { Text, View, FlatList, ScrollView, Pressable, TouchableOpacity, Alert, TextInput, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/utils/AuthProvider';
import { Cover, Images } from '@/app/(tenant)/(aux)/homecomponents';
import { supabase } from '@/utils/supabase';
import { Amenities, BottomBar } from '@/app/(tenant)/(aux)/detailscomponent';
import * as ImagePicker from 'expo-image-picker';
import { loadImages } from '@/api/ImageFetching';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { DataItem } from '@/api/Properties';

export default function BHDetails() {
  const user = useAuth()?.session.user;
  const [data, setData] = useState<DataItem | null>(null);
  const [propertyID, setPropertyID] = useState("")
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const hasFetched = useRef(false);
  const [isEditable, setIsEditable] = useState(false)

  useEffect(() => {
    if (!hasFetched.current) {
      async function fetchData() {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("property")
            .select("property_id")
            .eq("owner_id", user?.id);
  
          if (error) {
            throw new Error(`Error fetching property ID: ${error.message}`);
          }
  
          if (data && data.length > 0) {
            setPropertyID(data[0]?.property_id);
          }
  
          if (propertyID) {
            const fetchedData = await fetchPropertyDetailsData(propertyID.toString());
            setData(fetchedData);
            await loadImages(propertyID, setImages);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [user?.id, propertyID]);
  

  const openImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true)
  }

  async function uploadImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const newPath = `${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`property_images/${propertyID}/${newPath}`, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log("Image uploaded successfully. Path:", newPath);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    }
}

return (
  <TouchableWithoutFeedback>
    <SafeAreaView className='flex-1'>
      {loading ? (
        <View className='flex-1 justify-center items-center'>
          <Text>Loading...</Text>
        </View>
       ) : ( 
        <View>
            {images.length > 0 ? (
              <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => 
                <View className='h-72 w-full'> 
                  <Pressable onPress={() => openImage(item)}>
                    <Cover item={{...item, propertyID}} />
                  </Pressable>
                </View>}
                initialNumToRender={4}
                maxToRenderPerBatch={5}
                windowSize={7}
              />
            ) : (
              <View className='w-full h-48 items-center bg-gray-300 justify-center'>
                <View className='overflow-hidden rounded-full'>
                  <Pressable
                  onPress={uploadImage} 
                  className='rounded-full bg-yellow p-5'
                  android_ripple={{color: "#FDFDD9"}}>
                    <Ionicons name='camera' size={32} color={"white"}/>
                  </Pressable>
                </View>
              </View>
            )}

          <View className='mx-5'>    
            {images.length > 0 ? (
              <View className='h-20 mt-2'>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[...images, { addMore: true }]}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) =>
                    item.addMore ? (
                      <TouchableOpacity
                      onPress={uploadImage} 
                      className='h-20 w-16 items-center justify-center border border-gray-300 rounded-md'>
                        <Ionicons name='add-outline'/>
                        <Text className='text-xs'>Add More</Text>
                      </TouchableOpacity>
                    ) : (
                      <View className='h-20 w-20 mr-2 rounded-md'>
                        <Pressable onPress={() => openImage(item)}>
                          <Images item={{...item, propertyID}}/>
                        </Pressable>
                      </View>
                    )
                  }
                  initialNumToRender={4}
                  maxToRenderPerBatch={5}
                  windowSize={7}
                />
              </View>
            ) : ( null )} 
          </View>

          <View className='mx-5 mt-5'>
            <View>
              <Text className='text-4xl font-semibold'>{data?.name}</Text>
            </View>
            
            <View className='my-2'>
              <TouchableOpacity
              className='flex-row items-center gap-x-1'>
                <Ionicons name='location-outline' size={15} color={'#FF8B00'}/>
                <Text className='text-base'>{data?.address}</Text>
              </TouchableOpacity>
            </View>
            
            <View className='mt-5'>
              <View className='flex-row items-center justify-between gap-x-1'>
                <Text className='text-xl font-semibold'>Description</Text>

                <Pressable 
                onPress={() => setIsEditable(!isEditable)}
                className='flex-row items-center gap-x-1'>
                  <Text className='text-yellow'>Tap to edit</Text>
                  <Ionicons name='pencil-outline' color={"#ffa233"}/>
                </Pressable>

              </View>
              <View className='mt-2 h-16'>
                {data?.description ? (
                  <TextInput
                  editable={isEditable}
                  value={data?.description}
                  className='p-2 border border-gray-300 rounded-md'/>
                ): (
                  <Text>
                    No description
                  </Text>
                )}
              </View>
              
              {isEditable && (
              <View className='absolute -bottom-6 right-0 flex-row items-center gap-x-2'>
                <Pressable className='p-2 border border-gray-300 rounded-md'>
                  <Text>Cancel changes</Text>
                </Pressable>
                <Pressable className='p-2 bg-yellow rounded-md'>
                  <Text className='text-white'>Save changes</Text>
                </Pressable>
              </View>
              )}
  
            </View>
          </View>

        
      </View>
      )} 
    </SafeAreaView>
</TouchableWithoutFeedback>
);
}
