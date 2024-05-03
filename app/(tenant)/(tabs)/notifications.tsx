import { ListRenderItemInfo, Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthProvider';
import { formatDate, formatTime } from '@/components/dateandtimeformat';
import { FlatList } from 'react-native-gesture-handler';

export default function Notifications() {
  const user = useAuth()?.session?.user?.id
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    getNotifications()
  })

  async function getNotifications() {
    try {
      const {data, error} = await supabase
      .from("notifications")
      .select('*')
      .eq('user_id', user)
      .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      
    }
  }
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-5'>
        <View className='flex-row items-center justify-between mb-4'>
          <View>
            <Text className='text-xl font-semibold'>Notifications</Text>
          </View>

          <Pressable 
          style={{backgroundColor: "#444"}}
          onPress={() => {}}
          android_ripple={{color: "white"}}
          className='p-3 rounded-md'>
            <Ionicons name='trash' color={"white"} size={20}/>
          </Pressable>
        </View>

        <View>
          <FlatList 
          data={notifications} 
          renderItem={({item, index}) => (
            <View className='bg-white p-5 rounded-md mb-3'>
              <Text>{item.body}</Text>
              <Text className='text-xs font-medium mt-2'>{formatDate(item.created_at)}</Text>
              </View>
          )}/>
        </View>
      </View>
    </SafeAreaView>
  )
}