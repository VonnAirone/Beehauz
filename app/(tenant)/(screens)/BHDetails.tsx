import { Alert, Pressable, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { supabase } from '@/utils/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { FileObject } from '@supabase/storage-js'
import { useAuth } from '@/utils/AuthProvider';
import { FlatList } from 'react-native-reanimated/lib/typescript/Animated';

interface DataItem {
  property_id: string;
  property_name: string;
  price: string;
  view_count: number;
}

export default function BHDetails() {
  let { propertyID } = useLocalSearchParams();
  const [data, setData] = useState<DataItem | null>(null);
  const userID = useAuth().session?.user.id
  const [path, setPath] = useState('')
  const [images, setImages] = useState<FileObject[]>([])
  const [loading, setLoading] = useState(true);

  async function fetchAndSetData() {
    try {
      const fetchedData = await fetchPropertyDetailsData(propertyID.toString());
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const Images = ({ item }: { item: FileObject }) => {
    const [image, setImage] = useState<string | null>(null);
  
    useEffect(() => {
      const downloadImage = async () => {
        try {
          const { data } = await supabase.storage
            .from('images')
            .download(`property_images/${propertyID}/${item.name}`);
  
          if (data) {
            const fr = new FileReader();
            fr.readAsDataURL(data!);
            fr.onload = () => {
              setImage(fr.result as string);
            };
          } else {
            console.log("no data");
          }
        } catch (error) {
          console.error('Error downloading image:', error.message);
        }
      };
  
      downloadImage();
    }, [propertyID, item.name]);
  
    return (
      <View>
        {image && <Image className='h-20 w-20' source={{ uri: image }} />}
      </View>
    );
  };
  
  
  const loadImages = async () => {
    try {
      const { data } = await supabase.storage.from('images').list(`property_images/${propertyID.toString()}`)
      if (data) {
        setImages(data)
      } else {
        console.log("No data")
      }
    } catch (error) {
      console.error('Error loading images:', error.message)
    }
  }

  useEffect(() => {
    fetchAndSetData();
    loadImages();
  }, [propertyID]);


  async function uploadImage(propertyID: string) {
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
      setPath(path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    }
  }

  return (
    <SafeAreaView className='flex-1'>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
        <View className='flex-row'>
          {images.map((image, index) => (
            <View key={index}>
              <Images
                item={image}
              />
            </View>

          ))}
        </View>
          <Text>{data?.property_name}</Text>
          <Text>{data?.view_count}</Text>
          <Text>{data?.price}</Text>
        </>
      )}

      <Pressable onPress={() => uploadImage(propertyID.toString())}>
        <View className='flex-row items-center border border-gray-200 p-3'>
          <Text style={{ fontSize: 16, marginRight: 2 }}>Upload</Text>
          <Ionicons name='cloud-upload-outline' />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
