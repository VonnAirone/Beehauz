import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import List from '@/app/(aux)/ImageList'

export default function Dashboard() {
  
  // async function uploadImage(propertyID: string) {
//   try {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: false,
//       allowsEditing: true,
//       quality: 1,
//       exif: false,
//     });

//     if (result.canceled || !result.assets || result.assets.length === 0) {
//       console.log('User cancelled image picker.');
//       return;
//     }

//     const image = result.assets[0];

//     if (!image.uri) {
//       throw new Error('No image uri!');
//     }

//     const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

//     const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
//     const newPath = `${Date.now()}.${fileExt}`;

//     const { data, error: uploadError } = await supabase.storage
//       .from('images')
//       .upload(`property_images/${propertyID}/${newPath}`, arraybuffer, {
//         contentType: image.mimeType ?? 'image/jpeg',
//       });

//     if (uploadError) {
//       throw uploadError;
//     }

//     console.log("Image uploaded successfully. Path:", newPath);
//     setPath(path)
//   } catch (error) {
//     if (error instanceof Error) {
//       Alert.alert(error.message);
//     } else {
//       throw error;
//     }
//   }
// }

  return (
    <List/>
  )
}

const styles = StyleSheet.create({})