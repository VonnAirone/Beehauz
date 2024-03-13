import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

const RatingComponent = ({ propertyId }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleRating = (value) => {
        setRating(value === rating ? 0 : value); // Toggle the rating if it's already selected
    };

    const handleReview = (text) => {
        setReview(text);
    };

    const handleSubmit = async () => {
        try {
            // Insert rating and review into Supabase database
            const { data, error } = await supabase.from('property_reviews').insert([
                { property_id: propertyId, rating, review },
            ]);

            if (error) {
                console.error('Error inserting review:', error.message);
            } else {
                console.log('Review inserted successfully:', data);
                // Optionally, you can show a success message or refresh the UI
            }
        } catch (error) {
            console.error('Error inserting review:', error.message);
        }
    };

    return (
        <View className="p-4">
            <Text className="text-lg font-bold mb-2">Your Rating:</Text>
            <View className="flex-row mb-4">
                {[1, 2, 3, 4, 5].map((value) => (
                    <TouchableOpacity
                        key={value}
                        onPress={() => handleRating(value)}
                        className={`text-xl ${value <= rating ? 'text-yellow-500' : 'text-gray-300'} mr-2`}
                    >
                        <Ionicons name={value <= rating ? 'star' : 'star-outline'} color={"#ffa233"} size={32}/>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-lg font-bold mb-2">Your Review:</Text>
            <TextInput
                className="border border-gray-300 rounded-md px-5 py-2 mb-4"
                onChangeText={handleReview}
                value={review}
                placeholder="Write your review here"
                multiline
            />
            <TouchableOpacity onPress={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded">
                <Text className="text-lg font-bold">Submit Review</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RatingComponent;
