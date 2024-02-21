
  // async function uploadAvatar() {
  //   try {
  //     setUploading(true)

  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsMultipleSelection: false,
  //       allowsEditing: true,
  //       quality: 1,
  //       exif: false,
  //     })

  //     if (result.canceled || !result.assets || result.assets.length === 0) {
  //       console.log('User cancelled image picker.')
  //       return
  //     }

  //     const image = result.assets[0]
  //     console.log('Got image', image)


  //     const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())

  //     const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
  //     const path = `${Date.now()}.${fileExt}`
  //     const { data, error: uploadError } = await supabase.storage
  //       .from('images')
  //       .upload(userID + "/" + path, arraybuffer, {
  //         contentType: image.mimeType ?? 'image/jpeg',
  //       })

  //     if (uploadError) {
  //       throw uploadError
  //     }
  //     setImageURL(CDNURL + userID + "/" + data.path)
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       Alert.alert(error.message)
  //     } else {
  //       throw error
  //     }
  //   } finally {
  //     setUploading(false)
  //   }
  // }

  // const uploadAvatar = async () => {
  //   try {
  //     setUploading(true);
  
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       base64: false,
  //       exif: false,
  //     });
  
  //     if (result.canceled) {
  //       throw new Error('You must select an image to upload.');
  //     }
  
  //     const file = {
  //       uri: result.assets[0].fileName,
  //       name: `avatar-${result.assets[0].fileName}`,
  //       type: 'image/*',
  //     };

  //     const image = result.assets[0]
  //     console.log('Got image', image)

  //     if (!image.uri) {
  //       throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
  //     }
  
  //     const filePath = `${file.name}`;
  
  //     const { data, error: uploadError } = await supabase.storage
  //       .from('images')
  //       .upload(userID + '/' + filePath, file.uri, {contentType: 'image/png'});
  
  //     if (uploadError) {
  //       throw uploadError;
  //     }
  
  //     setImage(CDNURL + userID + "/" + file.name)
  //     alert('Avatar uploaded successfully!');
  //   } catch (error) {
  //     console.error('Error uploading avatar:', error.message);
  //     alert('Error uploading avatar!');
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  



  // import React, { useEffect, useState } from 'react';
  // import { Ionicons } from '@expo/vector-icons';
  // import { View, Text, Pressable, Image } from 'react-native';
  // import * as ImagePicker from 'expo-image-picker';
  // import { supabase } from '@/utils/supabase';
  // import { useAuth } from '@/utils/AuthProvider';
  
  // interface Props {
  //   size: number
  //   url: string | null
  //   onUpload: (filePath: string) => void
  // }
  
  // const UploadPage = ({url, onUpload}: Props) => {
  //   const [uploading, setUploading] = useState(false);
  //   const session = useAuth();
  //   const userID = session?.session.user.id;
  //   const [image, setImage] = useState<string | null>(null);
  //   const CDNURL =  'https://wyqvnzwtqrqxigotcvdy.supabase.co/storage/v1/object/public/images/'
  
  //   useEffect(() => {
  //     if (url) downloadImage(url)
  //   }, [url])
  
  //   async function downloadImage(path: string) {
  //     try {
  //       const { data, error } = await supabase.storage.from('images').download(path)
  
  //       if (error) {
  //         throw error
  //       }
  
  //       const fr = new FileReader()
  //       fr.readAsDataURL(data)
  //       fr.onload = () => {
  //         setImage(fr.result as string)
  //       }
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         console.log('Error downloading image: ', error.message)
  //       }
  //     }
  //   }
  
  //   const uploadAvatar = async () => {
  //     try {
  //       setUploading(true);
    
  //       const result = await ImagePicker.launchImageLibraryAsync({
  //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //         allowsMultipleSelection: false,
  //         allowsEditing: true,
  //         quality: 1,
  //         exif: false,
  //       });
    
  //       if (result.canceled) {
  //         throw new Error('You must select an image to upload.');
  //       }
    
        
  //       const image = result.assets[0]
  //       const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())
  //       const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
  //       const path = `${Date.now()}.${fileExt}`
    
  //       const { data, error: uploadError } = await supabase.storage
  //         .from('images')
  //         .upload(userID + '/' + path, arraybuffer, {contentType: image.mimeType ?? 'image/jpeg',});
    
  //       if (uploadError) {
  //         throw uploadError;
  //       }
    
  //       setImage(data.path)
  //       alert('Avatar uploaded successfully!');
  //     } catch (error) {
  //       console.error('Error uploading avatar:', error.message);
  //       alert('Error uploading avatar!');
  //     } finally {
  //       setUploading(false);
  //     }
  //   };
    
  
  //   // async function getImage() {
  //   //   try {
  //   //     const { data, error } = await supabase
  //   //       .storage
  //   //       .from('images')
  //   //       .list(userID + '/', {
  //   //         offset: 0,
  //   //         sortBy: { column: 'name', order: 'asc' },
  //   //       });
    
  //   //     if (error) {
  //   //       throw error;
  //   //     }
    
  //   //     if (data !== null) {
  //   //       setImages(data);
  //   //     } 
  //   //   } catch (error) {
  //   //     console.error('Error getting images:', error.message);
  //   //   }
  //   // }
    
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Pressable
  //         onPress={uploadAvatar}
  //         style={{
  //           justifyContent: 'center',
  //           borderWidth: 1,
  //           borderColor: 'gray',
  //           padding: 10,
  //           alignItems: 'center',
  //           borderRadius: 5,
  //         }}>
  //         {uploading ? (
  //           <Text>Uploading...</Text>
  //         ) : (
  //           <Text>
  //             Upload <Ionicons name="cloud-upload-outline" />
  //           </Text>
  //         )}
  //       </Pressable>
  //       {image ? (
  //         <View>
  //         <Text>{CDNURL + userID + "/" + image}</Text>
  //         <Image
  //           source={{ uri: image }}
  //           accessibilityLabel="Avatar"
  //         />
  //         </View>
  //       ) : (
  //         <View/>
  //       )}
  //     </View>
  //   );
  // };
  
  // export default UploadPage;
  
  