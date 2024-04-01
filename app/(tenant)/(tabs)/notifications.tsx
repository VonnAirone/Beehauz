import { View, Text, Image, ActivityIndicator, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { uploadAvatar } from '@/api/ImageFetching';
import { useAuth } from '@/utils/AuthProvider';

export default function Notifications() {
  const userID = useAuth()?.session.user.id;
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadData, setReloadData] = useState(false);

  useEffect(() => {
    fetchAvatar();
  }, [userID, reloadData]);


  const fetchAvatar = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.storage.from('images').list(`avatars/${userID}`);
      if (data && data.length > 0) {
        const lastAvatar = data[data.length - 1];
        const avatarURL = await downloadAvatar(userID, lastAvatar.name);
        setAvatar(avatarURL);
      } else {
        console.log('No avatar found');
      }
    } catch (error) {
      console.error('Error loading avatar:', error.message);
    } finally {
      setLoading(false)
    }
  };

  const downloadAvatar = async (userID, itemName) => {
    try {
      const { data } = await supabase.storage
        .from('images')
        .download(`avatars/${userID}/${itemName}`);
      
      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setAvatar(fr.result);
        };
      } else {
        console.log('No data for avatar');
        return null;
      }
    } catch (error) {
      console.error('Error downloading avatar:', error.message);
      return null;
    }
  };

  async function changeProfile() {
    await uploadAvatar(userID);
    setAvatar(null);
    fetchAvatar();
  }
  
  return (
    <View>
      {loading ? (
        <ActivityIndicator size={'large'}/>
      ) : (
        <View>
          <Text>Notifications</Text>
          {avatar && <Image source={{ uri: avatar }} style={{ width: 100, height: 100 }} />}

          <Pressable 
          onPress={changeProfile}
          className='self-center bg-gray-700 p-2 rounded-md'>
            <Text className='text-white'>Upload New Photo</Text>
          </Pressable>
        </View>
      )}
     

    </View>
  );
}
