import { Text, View, Alert, Modal, TouchableOpacity, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import * as ImagePicker from 'expo-image-picker'
import { fetchPropertyListData } from '@/api/DataFetching'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

type DataItem = {
  property_id: string;
  property_name: string;
  price: string;
  view_count: number;
};

export default function Map() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await fetchPropertyListData();
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  
  async function uploadAvatar() {
    try {

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to only images
        allowsMultipleSelection: false, // Can only select one image
        allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
        quality: 1,
        exif: false, // We don't want nor need that data.
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }

      const image = result.assets[0]

      if (!image.uri) {
        throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload("property_images/" + path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        })

      if (uploadError) {
        throw uploadError
      }

      console.log(data.path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        throw error
      }
    }
  }
  return (
    <View className='flex-1 justify-center items-center'>
      <Pressable 
      onPress={() => router.push("/Push")}
      className='border border-gray-300 bg-white p-4 rounded-md'>
        <Text>Press here</Text>
      </Pressable>
    </View>
  )
}