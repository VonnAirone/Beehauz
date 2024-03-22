import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Alert, TextInput, TouchableWithoutFeedback, Keyboard, Pressable, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/AuthProvider';
import { supabase } from '@/utils/supabase';
import * as ImagePicker from 'expo-image-picker';
import { loadImages } from '@/api/ImageFetching';
import { fetchAmenities, fetchPropertyDetailsData } from '@/api/DataFetching';
import { PropertyData } from '@/api/Properties';
import { Ionicons } from '@expo/vector-icons';
import { Images } from '@/app/(tenant)/(aux)/homecomponents';

const AmenitiesList = [
  { id: 1, name: 'Private CR' },
  { id: 2, name: 'Public CR' },
  { id: 3, name: 'Wifi'},
  { id: 4, name: 'Laundry Area'},
  { id: 5, name: 'CCTV'},
  { id: 6, name: 'Lobby'}
];


export default function BHDetails() {
  const user = useAuth()?.session.user;
  const [data, setData] = useState<PropertyData | null>(null);
  const [propertyID, setPropertyID] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const hasFetched = useRef(false);
  const [amenities, setAmenities] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [allowEdit, setAllowEdit] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const toggleAmenity = (amenityName) => {
    if (selectedAmenities.includes(amenityName)) {
      setSelectedAmenities(selectedAmenities.filter(name => name !== amenityName));
      console.log(selectedAmenities)
    } else {
      console.log(selectedAmenities)
      setSelectedAmenities([...selectedAmenities, amenityName]);
    }
  };

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
            await fetchAmenities(propertyID, setAmenities);
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
    setShowImageModal(true);
  };

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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className='flex-1'>
          <View className='p-10'>
            <View className='flex-row items-center justify-between'>
              <Text className='font-semibold text-xl'>Manage Property</Text>
              <Pressable onPress={() => setAllowEdit(!allowEdit)}>
                <Ionicons name='create-outline' size={20}/>
              </Pressable>
              
            </View>
            <View className='gap-y-2 mt-5'>
              <Text className='font-semibold'>Property Name </Text>
              <TextInput 
              className='w-full border border-gray-200 rounded-md py-2 px-5' value={data?.name}
              editable={allowEdit}/>
            </View>

            <View className='gap-y-2 mt-2'>
              <Text className='font-semibold'>Description</Text>
              <TextInput className='w-full border border-gray-200 rounded-md py-2 px-5' 
              editable={allowEdit}
              multiline
              value={data?.description}/>
            </View>

            <View className='gap-y-2 mt-2'>
              <Text className='font-semibold'>Address</Text>
              <TextInput className='w-full border border-gray-200 rounded-md py-2 px-5'
              editable={allowEdit} 
              multiline
              value={data?.address}/>
            </View>

            <View className='gap-y-2 mt-2'>
              <Text className='font-semibold'>Images</Text>
              {images.length > 0 ? (
              <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => 
                <View className='h-20 w-20 mr-2'> 
                  <Pressable onPress={() => openImage(item)}>
                    <Images item={{...item, propertyID}} />
                  </Pressable>
                </View>}
                initialNumToRender={4}
                maxToRenderPerBatch={5}
                windowSize={7}
              />
              ) : (
                <View className='h-20 w-20 bg-gray-200'/>
              )}

              {allowEdit && (
                <Pressable className='bg-gray-50 rounded-md flex-row items-center p-3 gap-x-2 justify-center'>
                  <Ionicons name='camera-outline'/>
                  <Text>Add Property Image</Text>
                </Pressable>
              )}
  
            </View>
            

            <View className='gap-y-2 mt-2'>
              <View className='flex-row items-end gap-x-1'>
                <Text className='font-semibold'>Amenities</Text>
                <Pressable onPress={() => setShowModal(true)}>
                  <Ionicons name='help-circle-outline' size={15}/>
                </Pressable>
              </View>
              

              {showModal && (
              <Pressable 
              onPress={() => setShowModal(false)}
              className='bg-gray-50 border  p-3 rounded-md absolute z-10 w-full flex-row items-center justify-between'>
                <Text className='text-xs'>Amenities typically refer to the facilities and services provided to the residents for their comfort, convenience, and daily living needs.</Text>
                <Ionicons name='close-outline' size={15}/>
              </Pressable>
              )}
              
  
              <FlatList 
                horizontal
                data={amenities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View key={index} className='mb-1 mr-2'>
                    <View className='relative grid select-none items-center whitespace-nowrap rounded-lg border border-gray-500 py-1.5 px-3 text-xs font-bold uppercase text-white'>
                      <Text>{item.amenity_name}</Text>
                    </View>
                  </View>
                )}
                />

              {allowEdit && (
                <View className='bg-gray-50 rounded-md flex-row items-center p-3 gap-x-2 justify-center'>
                  <Ionicons name='add-outline'/>
                  <Text>Add Amenities</Text>
                </View>
              )}
  
            </View>

          </View>
        {/* )}  */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
