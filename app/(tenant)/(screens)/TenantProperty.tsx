import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router';
import { fetchPropertyDetailsData } from '@/api/DataFetching';
import { PropertyData } from '@/api/Properties';
import { Ionicons } from '@expo/vector-icons';

export default function TenantProperty() {
  let { propertyID, date_joined } = useLocalSearchParams();
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);


  async function fetchPropertyData () {
    try {
      const data = await fetchPropertyDetailsData('23')

      if (data) {
        setPropertyData(data)
      }
    } catch (error) {
      console.log("Error fetching property data: ", error.message)
    }
  }

  useEffect(() => {
    async function fetchData() {
      await fetchPropertyData()
    }

    fetchData()
  }, [])

  return (
    <SafeAreaView>
      <View className='p-5'>
        <View>
          <Text className='font-medium'>You are currently boarding at:</Text>
        </View>

        <View className='h-40 w-full bg-gray-200 rounded-md mt-4'/>
        <View className='mt-3'>
          <Text className='text-lg font-medium'>{propertyData?.name}</Text>
        </View>

        <View className='flex-row items-center gap-x-1 mt-2'>
          <Ionicons name='location' size={15} color={"#444"}/>
          <Text>{propertyData?.address}</Text>
        </View>

        <View className='mt-3'>
          <View className='flex-row items-center gap-x-1'>
            <Text className='font-semibold'>Description</Text>
          </View>
          <View className='mt-2'>
            {propertyData?.description ? (
              <Text>
                {propertyData?.description}
              </Text>
            ): (
              <Text>
                No description
              </Text>
            )}
          </View>
        </View>

        <View>
          <Text>Date Joined: {}</Text>
        </View>

      </View>
    </SafeAreaView>
  )
}