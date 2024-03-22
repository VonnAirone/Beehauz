import { downloadAvatar } from '@/api/ImageFetching';
import React, { useState, useEffect, memo } from 'react';
import { View, Image } from 'react-native';

interface AvatarProps {
  item: any;
  userProfile: any; // Assuming userProfile is defined somewhere
}

const Avatar: React.FC<AvatarProps> = memo(({ item, userProfile }) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      downloadAvatar(userProfile?.first_name, item.name, setImage);
    } 
  }, [userProfile?.first_name, item.name, image]);

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

export default Avatar;

// const SingleImageDisplay = ({ username }) => {
//   const [images, setImages] = useState([]);
//   const hasFetched = useRef(false);

//   useEffect(() => {
//     if (!hasFetched.current) {
//       const fetchImages = async () => {
//         try {
//           await loadAvatar(username, setImages)
//         } catch (error) {
//           console.error('Error fetching images:', error);
//         }
//       };
  
//       fetchImages();
//     }
//   }, [username]);

  

//   if (images.length > 0) {
//     const firstImage = images[0];
//     return (
//       <View className="flex-1">
//         <Avatar 
//         item={{ ...firstImage, username }} />
//       </View>
//     );
//   }}