import { downloadImage, loadImages } from "@/api/ImageFetching";
import { handlePropertyClick } from "@/api/ViewCount";
import { router } from "expo-router";
import React, { memo, useEffect, useRef, useState } from "react";
import { FlatList as RNFlatList, Pressable, View, Text, Image, ActivityIndicator, FlatList } from "react-native";

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
    } 
   router.push({pathname: "/(tenant)/(screens)/BHDetails", params: {propertyID: propertyID}})
  };

  //THIS IS THE IMAGE COMPONENT THAT DISPLAYS THE IMAGE
  const Images = memo(({ item }: { item: any }) => {
    const [image, setImage] = useState<string | null>(null);
  
    useEffect(() => {
      // Check if image data is already available
      if (!image) {
        // If not available, fetch the image data
        downloadImage(item.propertyID, item.name, setImage);
      }
    }, [item.propertyID, item.name, image]); // Add image to the dependency array
  
    if (!image) {
      return (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size="large" />
        </View>
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
  

  //THIS IS THE SINGLE IMAGE DISPLAY COMPONENT THAT DISPLAY A SINGLE IMAGE OF A CERTAIN PROPERTY
  export const SingleImageDisplay = ({ propertyID }) => {
    const [images, setImages] = useState([]);
  
    useEffect(() => {
      const fetchImages = async () => {
        try {
          await loadImages(propertyID, setImages)
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };
  
      fetchImages();
    }, [propertyID]);
  
    // if (loading) {
    //   return (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //       <ActivityIndicator size="large" />
    //     </View>
    //   );
    // }
  
    if (images.length > 0) {
      const firstImage = images[0];
      return (
        <View className="flex-1 rounded-md">
          <Images 
          item={{ ...firstImage, propertyID }} />
        </View>
      );
    } else {
      return (
        <View className="flex-1 justify-center items-center border border-gray-300 rounded-md">
          <Text>No images found</Text>
        </View>
      );
    }
  };

  //THIS IS THE POPULAR NOW COMPONENT FOR THE MOST VISITED PROPERTIES
  export function PopularNow({ data }: { data: DataItem[]}) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const hasFetched = useRef(false);
  
    useEffect(() => {
      if (!hasFetched.current) {
        async function fetchData() {
          try {
            await loadImages(data, setImagesLoaded); // Set imagesLoaded to true once all images are loaded
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
              <SingleImageDisplay propertyID={item.property_id} />
            </View>
  
            <View className='mt-2'>
              <Text className='font-semibold text-xl'>{item.property_name}</Text>
              <Text>{item.price}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  
    return (
      <>
        {imagesLoaded && (
          <RNFlatList
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', paddingLeft: '6%' }}
            data={data}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
          />
        )}
      </>
    );
  }
  

  //THIS IS FOR THE NEARBY ME COMPONENT THAT DISPLAYS PROPERTY NEARBY THE USER

  //!!!NOTE!!! THIS IS STILL NOT
  export function NearbyMe({ data }: PropertyProps) {
    const renderItem = ({ item, index }: { item: DataItem; index: number }) => (
      <View className='overflow-hidden'>
        <View className="p-2">
          <Pressable 
          onPress={() => handleCardPress(item.property_id)}>
            
            <View className='h-40 w-72'>
              <SingleImageDisplay propertyID={item.property_id}/>
            </View>
              
              <View className="mt-2">
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