import { downloadImage, loadAvatar, loadImages } from "@/api/ImageFetching";
import { handlePropertyClick } from "@/api/ViewCount";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useEffect, useRef, useState } from "react";
import { FlatList as RNFlatList, Pressable, View, Text, Image, ActivityIndicator, FlatList } from "react-native";
import AvatarImage from "./avatar";
import { PropertyData, UserData } from "@/api/Properties";


 
  const handleCardPress = async (propertyID: string) => {
    try {
      await handlePropertyClick(propertyID);
    } catch (error) {
      console.error('Error handling property click:', error);
    } 
   router.push({pathname: "/(tenant)/(screens)/BHDetails", params: {propertyID: propertyID}})
  };


  export const Images = memo(({ item }: { item: any }) => {
    const [image, setImage] = useState<string | null>(null);
  
    useEffect(() => {
      if (!image) {
        downloadImage(item.propertyID, item.name, setImage);
      }

    }, [item.propertyID, item.name, image]);
  
    if (!image) {
      return (
        <View className='bg-gray-300'/>
      );
    }
  
    return (
      <Image
        className='w-full h-full rounded-lg'
        source={{ uri: image }}
        resizeMode="cover"
      />
    );
  });

  export const Cover = memo(({ item }: { item: any }) => {
    const [image, setImage] = useState<string | null>(null);
  
    useEffect(() => {
      if (!image) {
        downloadImage(item.propertyID, item.name, setImage);
      }

    }, [item.propertyID, item.name, image]);
  
    if (!image) {
      return (
        <View className='bg-gray-300'/>
      );
    }
  
    return (
      <Image
        className='w-full h-full'
        source={{ uri: image }}
        resizeMode="cover"
      />
    );
  });


  
  

  export const SingleImageDisplay = ({ propertyID }) => {
    const [images, setImages] = useState([]);
    const hasFetched = useRef(false)
  
    useEffect(() => {
      if (!hasFetched.current) {
        const fetchImages = async () => {
          try {
            await loadImages(propertyID, setImages)
          } catch (error) {
            console.error('Error fetching images:', error);
          }
        };
        fetchImages();
      }
  
      
    }, [propertyID]);

    
  
    if (images.length > 0) {
      const firstImage = images[0];
      return (
          <Images 
          item={{ ...firstImage, propertyID }} />
      );
    }
  };

  //THIS IS THE POPULAR NOW COMPONENT FOR THE MOST VISITED PROPERTIES
  export function PopularNow({ data }: { data: PropertyData[]}) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const hasFetched = useRef(false);
  
    useEffect(() => {
      setImagesLoaded(true)
      if (!hasFetched.current) {
        async function fetchData() {
          try {
            await loadImages(data, setImagesLoaded);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
        fetchData();
      }
    }, [data]);
  
    const renderItem = ({ item, index }: { item: PropertyData; index: number }) => (
      <View className='overflow-hidden'>
        <Pressable onPress={() => handleCardPress(item.property_id)}>
          <View>
            <View className="h-40 w-40">
              <SingleImageDisplay propertyID={item.property_id}/>
            </View>
  
            <View className='mt-2'>
              <Text className="font-bold text-base">{item.name}</Text>
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="bed-outline"/>
                <Text className="text-xs">{item.available_beds} Beds</Text>
              </View>
              <Text className="font-semibold">{item.price} / month</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );

    const skeleton = () => (
      <View className="p-2">
        <View className='bg-gray-300 w-40 h-36 rounded-md'/>
        <View className='mt-2 h-4 w-32 bg-gray-300 rounded-md'></View>
        <View className='mt-2 h-2 w-20 bg-gray-300 rounded-md'></View>
    </View>
    );
  
    return (
      <>
          <RNFlatList
            data={data}
            renderItem={imagesLoaded ? renderItem : skeleton}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            
          />
      </>
    );
  }
  
  export function PropertyList({ data }: { data: PropertyData[]}) {

    const [imagesLoaded, setImagesLoaded] = useState(false);
    const hasFetched = useRef(false);
  
    useEffect(() => {
      if (!hasFetched.current) {
        async function fetchData() {
          try {
            await loadImages(data, setImagesLoaded);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
        fetchData();
      }
    }, [data]);

    const renderItem = ({ item, index }: { item: PropertyData; index: number }) => (
      <View className='overflow-hidden'>
        <View>
          <Pressable 
          onPress={() => handleCardPress(item.property_id)}>
            <View className='h-40 w-72'>
              <SingleImageDisplay propertyID={item.property_id}/>
            </View>
              
              <View className="mt-2">
                <Text className='font-semibold text-xl'>{item.name}</Text>
                <Text>{item.price}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" color={'#FFA233'}/>
                  <Text className="text-yellow">{item.address}</Text>
                </View>
                
              </View>
          </Pressable>
        </View>
      </View>
    );

    const skeleton = () => (
        <View className="p-2">
            <View className='bg-gray-300 w-72 h-40 rounded-md'/>
            <View className='mt-2 h-4 w-32 bg-gray-300 rounded-md'></View>
            <View className='mt-2 h-3 w-16 bg-gray-300 rounded-md'></View>
            <View className='mt-2 h-3 w-48 bg-gray-300 rounded-md'></View>
        </View>
    )
  
    return <RNFlatList 
    data={data} 
    renderItem={imagesLoaded ? renderItem : skeleton} 
    showsHorizontalScrollIndicator={false} 
    horizontal={true} />;
  };


  export function Services() {
    return (
      <View className="ml-5">
        <View className="p-2 flex-row gap-x-5 mt-2">
          <View className="items-center justify-center">
            <View className="">
              <Image className="w-8 h-8 object-contain" source={require("assets/services icons/laundry-machine.png")}/>
            </View>
            <Text className="mt-2">Laundry Shops</Text>
          </View>

          <View className="items-center justify-center">
            <View className="">
              <Image className="w-8 h-8 object-contain" source={require("assets/services icons/tools.png")}/>
            </View>
            <Text className="mt-2">Barber Shops</Text>
          </View>

          <View className="items-center justify-center">
            <View className="">
              <Image className="w-8 h-8 object-contain" source={require("assets/services icons/school.png")}/>
            </View>
            <Text className="mt-2">School Supplies</Text>
          </View>

          <View className="items-center justify-center">
            <View className="">
              <Image className="w-8 h-8 object-contain" source={require("assets/services icons/water-tap.png")}/>
            </View>
            <Text className="mt-2">Refilling Stations</Text>
          </View>
      </View>
    </View>
    )
  }


  export function Avatar({ data }: { data: UserData[]}) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const hasFetched = useRef(false);
  
    useEffect(() => {
      setImagesLoaded(true)
      if (!hasFetched.current) {
        async function fetchData() {
          try {
            await loadAvatar(data, setImagesLoaded);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
        fetchData();
      }
    }, [data]);
  
    const renderItem = ({ item, index }: { item: UserData; index: number }) => (
      <View >
        <View style={{ width: 160, height: 144 }}>
          <AvatarImage username={item.first_name}/>
        </View>
      </View>
    );
  }

  