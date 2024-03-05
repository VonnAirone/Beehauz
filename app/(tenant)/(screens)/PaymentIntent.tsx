// CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios'
import { router } from 'expo-router';

const CheckoutScreen = ({ navigation }) => {
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  const handlePayment = async () => {
    if (paymentIntentId) {
      const paymentUrl = await getPaymentUrl(paymentIntentId); 
      router.push({pathname: "/PaymentIntent", params: {paymentUrl}})
    }
  };

  return (
    <View>
      <Text>Review your order</Text>
      <Button title="Proceed to Payment" onPress={handlePayment} />
    </View>
  );
};

const createPaymentIntent = async () => {
    try {
      const response = await axios.post(
        'https://api.paymongo.com/v1/payment_intents',
        {
          data: {
            attributes: {
              amount: 10000, 
              payment_method_allowed: ['card'],
              currency: 'PHP',
            },
          },
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Basic c2tfdGVzdF9aUzVtWUNMZEFjTFFIN29hZW1BTGl1TjY6',
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Payment Intent Created:', response.data);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  };
  
  createPaymentIntent();

const getPaymentUrl = async (paymentIntentId) => {
  const response = await axios.post('YOUR_SERVER_ENDPOINT/getPaymentUrl', {
    paymentIntentId,
  });
  return response.data.paymentUrl;
};

export default CheckoutScreen;
