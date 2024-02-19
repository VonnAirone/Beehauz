import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPropertyDetailsData } from '@/api/DataFetching';

  interface DataItem {
    property_id: string;
    property_name: string;
    price: string;
    view_count: number;
  }

export default function BHDetails() {
    let {propertyID} = useLocalSearchParams();
    const [data, setData] = useState<DataItem | null>(null);
    const [loading, setLoading] = useState(false)

    async function fetchAndSetData() {
        // Simulate a delay, you can adjust this value
        await new Promise(resolve => setTimeout(resolve, 2000));
    
        const fetchedData = await fetchPropertyDetailsData(propertyID.toString());
        setData(fetchedData);
        setLoading(false);
      }
    
      useEffect(() => {
        fetchAndSetData();
      }, [propertyID]);

    
  return (
    <SafeAreaView className='flex-1 p-5'>
        <View className='border border-gray-200 h-80 w-full rounded-md'>

        </View>
        <Text>{data.property_name}</Text>
        <Text>{data.view_count}</Text>
        <Text>{data.price}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})