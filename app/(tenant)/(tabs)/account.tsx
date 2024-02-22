import { Pressable, SafeAreaView, Text, View, Modal, Alert, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import Logo from '@/components/logo'
import ModalScreen from '@/app/modal';

export default function Account() {

  const [modalVisible, setModalVisible] = useState(false);
  
  return (
    <SafeAreaView className='flex-1 w-80 justify-center m-auto'>
      <View className='items-start -left-4'>
        <Logo/>
      </View>

      <View className='items-center mb-10'>
        <View className='bg-slate-300 h-20 w-20 rounded-full mb-2'></View>
        <Text className='text-xl font-semibold'>Airone Vonn Villasor</Text>
      </View>

      <View className='flex-row justify-between'>
        <Text className='text-base text-yellow-600'>Personal Information</Text>
        <Pressable className='flex-row items-center gap-x-1'>
          <Ionicons name='pencil'/>
          <Text>Edit</Text>
        </Pressable>
      </View>

      <View className='gap-y-3 mt-3 mb-10'>
        <View className='flex-row justify-between p-2'>
          <View className='flex-row items-center gap-x-2 opacity-60'>
            <Ionicons name='mail-outline' size={18}/>
            <Text className='text-base'>Email</Text>
          </View>

          <View>
            <Text>villasoraironevonn@gmail.com</Text>
          </View>
        </View>

        <View className='border-b opacity-10'></View>

        <View className='flex-row justify-between p-2'>
          <View className='flex-row items-center gap-x-2 opacity-60'>
            <Ionicons name='phone-portrait-outline' size={18}/>
            <Text className='text-base'>Phone</Text>
          </View>

          <View>
            <Text>09491488343</Text>
          </View>
        </View>

        <View className='border-b opacity-10'></View>

        <View className='flex-row justify-between p-2'>
          <View className='flex-row items-center gap-x-2 opacity-60'>
            <Ionicons name='location-outline' size={18}/>
            <Text className='text-base'>Location</Text>
          </View>

          <View>
            <Text>09491488343</Text>
          </View>
        </View>
      </View>

      <View>
        <Text className='text-base text-yellow-600'>Utilities</Text>
      </View>

      <View className='gap-y-3 mt-3 mb-10'>
        <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
          <View className='flex-row justify-between items-center'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='document-text-outline' size={18}/>
              <Text className='text-base'>Transaction History</Text>
            </View>

            <View>
              <Ionicons name='chevron-forward-outline'/>
            </View>
          </View>
        </Pressable>

        <View className='border-b opacity-10'></View>

        <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
          <View className='flex-row justify-between items-center'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='information-circle-outline' size={18}/>
              <Text className='text-base'>Help Center</Text>
            </View>

            <View>
              <Ionicons name='chevron-forward-outline'/>
            </View>
          </View>
        </Pressable>

        <View className='border-b opacity-10'></View>

        <Pressable android_ripple={{color: 'f1f1f1'}} className='p-2'>
          <View className='flex-row justify-between items-center'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='star-half-outline' size={18}/>
              <Text className='text-base'>Rate this app</Text>
            </View>

            <View>
              <Ionicons name='chevron-forward-outline'/>
            </View>
          </View>
        </Pressable>

        <View className='border-b opacity-10'></View>

        <Pressable
        onPress={() => setModalVisible(true)}
        android_ripple={{color: 'f1f1f1'}} 
        className='p-2'>
          <View className='flex-row justify-between items-center'>
            <View className='flex-row items-center gap-x-2 opacity-60'>
              <Ionicons name='log-out-outline' size={18}/>
              <Text className='text-base'>Logout</Text>
            </View>

            <View>
              <Ionicons name='chevron-forward-outline'/>
            </View>
          </View>
        </Pressable>
        
      </View>

      
      {/* MODAL AREA */}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>

        <View className='flex-1 justify-center items-center'>
          <View className='bg-white h-40 w-72 rounded-md justify-center'>

            <View className='absolute top-2 right-3'>
              <Ionicons name='close-outline' size={20}/>
            </View>

            <Text className='text-center font-semibold text-base mb-3'>Are you sure about logging out?</Text>
            <Pressable
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
