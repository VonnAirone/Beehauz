import React, { memo, useState, useEffect, useRef } from 'react';
import { View, Image } from 'react-native';
import { downloadAvatar, loadAvatar } from '@/api/ImageFetching';

const Avatar = memo(({ item, name }: { item: any, name }) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      downloadAvatar(name, item.name, setImage);
    }
  }, [name, item.name, image]); 

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

const AvatarDisplay = ({ username }) => {
  const [images, setImages] = useState([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      const fetchImages = async () => {
        try {
          await loadAvatar(username, setImages)
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };
  
      fetchImages();
    }
  }, [username]);
  
  if (images.length > 0) {
    const firstImage = images[0];
    return (
      <View className="flex-1">
        <Avatar 
        name={username}
        item={firstImage} />
      </View>
    );
  }}

const AvatarImage = ({ username }) => {
  return (
    <View className='flex-1 items-center justify-center'>
      <AvatarDisplay username={username}/>
    </View>
  );
};

export default AvatarImage;
