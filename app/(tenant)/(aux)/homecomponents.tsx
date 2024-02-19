import { handlePropertyClick } from "@/api/ViewCount";
import { router } from "expo-router";
import React from "react";
import { FlatList as RNFlatList, Pressable, View, Text } from "react-native";

type DataItem = {
    property_id: string;
    property_name: string;
    price: string;
    view_count: number;
  };
  
  type PropertyProps = {
    data: DataItem[];
  };

  // THIS IS TO ADD VIEW COUNT EVERYTIME A USER CLICKS A PROPERTY AS WELL AS TO REDIRECT THE USER TO THE BH DETAILS
  const handleCardPress = async (propertyID: string) => {
    try {
      await handlePropertyClick(propertyID);
    } catch (error) {
      console.error('Error handling property click:', error);
    } finally {
      console.log(propertyID)
    }
   router.push({pathname: "/(tenant)/(screens)/BHDetails", params: {propertyID: propertyID}})
  };

  export function PopularNow({ data }: PropertyProps) {
    const renderItem = ({ item, index }: { item: DataItem; index: number }) => (
      <View className='overflow-hidden'>
        <Pressable 
        onPress={() => handleCardPress(item.property_id)}>
          <View className='p-2'>
            <View className='border rounded-md border-gray-200 flex w-40 h-36 p-5 m-auto'>
              
            </View>
            
            <View className='mt-2'>
              <Text className='font-semibold text-xl'>{item.property_name}</Text>
              <Text>{item.price}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  
    return <RNFlatList contentContainerStyle={{justifyContent: 'center', alignItems: 'center', paddingLeft: "6%"}} data={data} renderItem={renderItem} showsHorizontalScrollIndicator={false} horizontal={true} />;
  };

  export function NearbyMe({ data }: PropertyProps) {
    const renderItem = ({ item, index }: { item: DataItem; index: number }) => (
      <View className='overflow-hidden'>
        <View className="p-2">
          <Pressable 
          onPress={() => handleCardPress(item.property_id)}>
            
            <View className='border rounded-md border-gray-200 flex h-40 w-72 p-5'></View>
              
              <View>
                <Text className='font-semibold text-xl'>{item.property_name}</Text>
                <Text>{item.price}</Text>
              </View>
          </Pressable>
        </View>
      </View>
    );
  
    return <RNFlatList contentContainerStyle={{justifyContent: 'center', alignItems: 'center', paddingLeft: "6%"}} data={data} renderItem={renderItem} showsHorizontalScrollIndicator={false} horizontal={true} />;
  };



  type ServiceProps = {
    name: string;
    image: string;
  };
  
  type ServicesProps = {
    data: ServiceProps[];
  };
  

  export function Services({ data }: ServicesProps) {
    const renderItem = ({ item }: { item: ServiceProps }) => (
      <View>
        <View className="p-2 flex-row gap-x-5 mt-2">
        <View className="items-center">
          <View className="h-14 w-14 border rounded-md border-gray-200">{item.image}</View>
          <Text className="mt-2">{item.name}</Text>
        </View>
        </View>
      </View>
    );
    return <RNFlatList contentContainerStyle={{justifyContent: 'center', alignItems: 'center', paddingLeft: "6%"}} data={data} renderItem={renderItem} showsHorizontalScrollIndicator={false} horizontal={true} />;
  }