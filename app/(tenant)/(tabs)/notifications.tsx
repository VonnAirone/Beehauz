import { StyleSheet, Text, View, Image } from 'react-native'
import React, { memo, useEffect, useState } from 'react'
import { downloadAvatar, downloadImage, loadAvatar, loadImages } from '@/api/ImageFetching';
import { useAuth } from '@/utils/AuthProvider';
import { getProfile } from '@/api/DataFetching';


export default function Notifications() {
  const username = "Airone Vonn Villasor"
  const user = useAuth()?.session.user.id;
  const propertyID = "1"

  // useEffect(() => {
  //   getUsername();
  // }, [username])

  // const getUsername = async () => {
  //   try {
  //     const data = await getProfile(user)
  //     if (data) {
  //       setUsername(data?.name)
  //     }
  //   } catch (error) {
  //     console.log("Error fetching username", error.message)
  //   }
  // }

  const Avatar = memo(({ item }: { item: any }) => {
    const [image, setImage] = useState<string | null>(null);
  
    useEffect(() => {
      if (!image) {
        downloadImage(propertyID, item.name, setImage);
      }
    }, [propertyID, item.name, image]);
  
    if (!image) {
      return (
        <View className='bg-gray-300'/>
      );
    }
  
    return (
      <Image
        className='w-full h-full rounded-md'
        source={{ uri: image }}
        resizeMode="cover"
      />
    );
  });

  const SingleImageDisplay = ({ propertyID }) => {
    const [images, setImages] = useState([]);
  
    useEffect(() => {
      const fetchImages = async () => {
        try {
          await loadImages(propertyID, setImages)
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };
  
      fetchImages();
    }, [propertyID]);

    
  
    if (images.length > 0) {
      const firstImage = images[0];
      return (
        <View className="flex-1 rounded-md">
          <Avatar 
          item={{ ...firstImage, username }} />
        </View>
      );
    } else {
      return (
        <View className="flex-1 justify-center items-center border border-gray-300 rounded-md">
          <Text>No images found</Text>
        </View>
      );
    }
  };

  return (
    <View className='flex-1 justify-center items-center'>
      <View className='w-20 h-20'>
        <SingleImageDisplay propertyID={propertyID}/>
      </View>
      
    </View>
  )


}

const styles = StyleSheet.create({})