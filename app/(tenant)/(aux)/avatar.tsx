import React, { memo, useState, useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { downloadAvatar, loadAvatar } from '@/api/ImageFetching';

const Avatar = memo(({ item, username }: { item: any; username: string }) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      downloadAvatar(username, item.name, setImage);
    }
  }, [username, item.name]);

  if (!image) {
    return <View></View>;
  }

  return (
    <Image
      className='w-full h-full rounded-full'
      source={{ uri: image }}
      resizeMode="cover"
    />
  );
});


const SingleImageDisplay = ({ username }) => {
  const [images, setImages] = useState([]); 

  useEffect(() => {
    const fetchImages = async () => {
      try {
        await loadAvatar(username, setImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [username]);

  if (images.length === 0) {
    return (
      <View>
        <Image className='h-14 w-14' source={require("@/assets/images/icon.png")}/>
      </View>
    )
  }

  const firstImage = images[0];
  return (
    <View className="flex-1">
      <Avatar item={{ ...firstImage}} username={username}/>
    </View>
  );
};

export default function AvatarImage({username}) {
    return (
        <View className='flex-1 items-center justify-center'>
            <SingleImageDisplay username={username}/>
        </View>
    )
}
