import { supabase } from "@/utils/supabase";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { Alert } from "react-native";

export const downloadImage = async (propertyID, itemName, setImage) => {
    try {
      const { data } = await supabase.storage
        .from('images')
        .download(`property_images/${propertyID}/${itemName}`);
  
      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setImage(fr.result);
        };
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.error('Error downloading image:', error.message);
    }
  };
  
  export const loadImages = async (propertyID, setImages) => {
    try {
      const { data } = await supabase.storage.from('images').list(`property_images/${propertyID}`);
      if (data) {
        setImages(data);
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.error('Error loading images:', error.message);
    }
  };

//   const [path, setPath] = useState('')
  export async function uploadImage(propertyID, setPath, path) {
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const newPath = `${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`property_images/${propertyID}/${newPath}`, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log("Image uploaded successfully. Path:", newPath);
      setPath(path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    }
  }