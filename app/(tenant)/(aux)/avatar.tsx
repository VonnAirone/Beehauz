import React, { memo, useState, useEffect, useRef } from 'react';
import { View, Image } from 'react-native';
import { downloadAvatar, loadAvatar } from '@/app/api/ImageFetching';

const Avatar = memo(({ item, userID }: { item: any, userID }) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      downloadAvatar(userID, item.name, setImage);
    }
  }, [userID, item.name, image]); 

  if (!image) {
    return (
      <View></View>
    );
  }

  return (
    <Image
      className='w-full h-full rounded-full'
      source={{ uri: image }}
      resizeMode="cover"
    />
  );
});

const AvatarDisplay = ({ userID }) => {
  const [images, setImages] = useState([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      const fetchImages = async () => {
        try {
          await loadAvatar(userID, setImages)
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };
  
      fetchImages();
    }
  }, [userID]);

  if (images.length === 0) {
    return (
      <View className='border border-gray-200 w-full h-full rounded-full'>
        <Image
        className='h-full w-full bg-white rounded-full' 
        source={require("@/assets/icon.png")}/>
      </View>
    )
  }
  
  if (images.length > 0) {
    const firstImage = images[0];
    return (
      <View className="w-full h-full">
        <Avatar 
        userID={userID}
        item={firstImage} />
      </View>
    );
  }}

const  AvatarImage = ({ userID }) => {
  return (
    <View className='flex-1 items-center justify-center'>
      <AvatarDisplay userID={userID}/>
    </View>
  );
};

export default AvatarImage;
