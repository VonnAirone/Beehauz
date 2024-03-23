import { StyleSheet, Text as RNText } from 'react-native';
import React from 'react';

export default function Text({ children, className }) {
  return (
    <RNText className={className}>
      {children}
    </RNText> 
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Rubik',
  },
});
