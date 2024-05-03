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

  export const downloadAvatar = async (userID, itemName, setImage) => {
    try {
      const { data } = await supabase.storage
        .from('images')
        .download(`avatars/${userID}/${itemName}`);
  
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

  export const loadAvatar = async (userID, setAvatar) => {
    try {
      const { data } = await supabase.storage.from('images').list(`avatars/${userID}`);
      if (data) {
        setAvatar(data);
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.error('Error loading images:', error.message);
    }
  };


  export async function uploadPropertyImage(propertyID, setPath, path) {
    
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

  export async function uploadAvatar(userID) {
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
        .upload(`avatars/${userID}/${newPath}`, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        console.log(uploadError)
      } else {
        console.log("Image uploaded successfully. Path:", newPath);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    }
}

// async function uploadAvatar() {
//   try {

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to only images
//       allowsMultipleSelection: false, // Can only select one image
//       allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
//       quality: 1,
//       exif: false, // We don't want nor need that data.
//     })

//     if (result.canceled || !result.assets || result.assets.length === 0) {
//       console.log('User cancelled image picker.')
//       return
//     }

//     const image = result.assets[0]

//     if (!image.uri) {
//       throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
//     }

//     const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())

//     const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
//     const path = `${Date.now()}.${fileExt}`

//     const { data, error: uploadError } = await supabase.storage
//       .from('images')
//       .upload(path, arraybuffer, {
//         contentType: image.mimeType ?? 'image/jpeg',
//       })

//     if (uploadError) {
//       throw uploadError
//     }

//     console.log(data.path)
//   } catch (error) {
//     if (error instanceof Error) {
//       Alert.alert(error.message)
//     } else {
//       throw error
//     }
//   }
// }

export async function uploadImage(propertyID) {
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
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    } else {
      throw error;
    }
  }
}

export async function uploadID(userID, imageSource) {
  try {
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsMultipleSelection: false,
    //   allowsEditing: true,
    //   quality: 1,
    //   exif: false,
    // });

    // if (result.canceled || !result.assets || result.assets.length === 0) {
    //   console.log('User cancelled image picker.');
    //   return;
    // }

    const image = imageSource;
    // if (!image.uri) {
    //   throw new Error('No image uri!');
    // }

    const arraybuffer = await fetch(image).then((res) => res.arrayBuffer());

    const fileExt = image?.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const newPath = `${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`identificationCards/${userID}/${newPath}`, arraybuffer, {
        contentType: image.mimeType ?? 'image/jpeg',
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log("Image uploaded successfully. Path:", newPath);
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    } else {
      throw error;
    }
  }
}