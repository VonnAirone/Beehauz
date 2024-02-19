import React from 'react';
import { TextInput } from 'react-native';

export default function InputField({
  value,
  placeholder,
  onChangeText,
  isPassword,
  isNumeric,
  isEditable
}) {
  
  return (
    <TextInput
      editable={isEditable}
      clearTextOnFocus
      value={value}
      keyboardType={isNumeric ? 'numeric' : 'default'}
      placeholder={placeholder}
      secureTextEntry={isPassword}
      onChangeText={onChangeText}
      className='p-3 pl-5 border-gray-200 focus:border-gray-400 border rounded-md w-80 text-sm'
    />
  );
}
