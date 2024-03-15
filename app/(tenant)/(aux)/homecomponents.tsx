import { downloadImage, loadImages } from "@/api/ImageFetching";
import { handlePropertyClick } from "@/api/ViewCount";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useEffect, useRef, useState } from "react";
import { FlatList as RNFlatList, Pressable, View, Text, Image, ActivityIndicator, FlatList } from "react-native";

type DataItem = {
    property_id: string;
    name: string;
    price: string;
    view_count: number;
    address: string;
  };
  
  type PropertyProps = {
    data: DataItem[];
  };

 
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
        className='w-full h-full rounded-md'
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
  export function PopularNow({ data }: { data: DataItem[]}) {
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
  
    const renderItem = ({ item, index }: { item: DataItem; index: number }) => (
      <View className='overflow-hidden'>
        <Pressable onPress={() => handleCardPress(item.property_id)}>
          <View className='p-2'>
            <View style={{ width: 160, height: 144 }}>
              <SingleImageDisplay propertyID={item.property_id}/>
            </View>
  
            <View className='mt-2'>
              <Text className='font-semibold text-xl'>{item.name}</Text>
              <Text>{item.price}</Text>
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
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', paddingLeft: '6%' }}
            data={data}
            renderItem={imagesLoaded ? renderItem : skeleton}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
          />
      </>
    );
  }
  

  //THIS IS FOR THE NEARBY ME COMPONENT THAT DISPLAYS PROPERTY NEARBY THE USER

  //!!!NOTE!!! THIS IS STILL NOT
  export function PropertyList({ data }: { data: DataItem[]}) {

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

    const renderItem = ({ item, index }: { item: DataItem; index: number }) => (
      <View className='overflow-hidden'>
        <View className="p-2">
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
    contentContainerStyle={{justifyContent: 'center', alignItems: 'center', paddingLeft: "6%"}} 
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