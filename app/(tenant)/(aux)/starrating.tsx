
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

const StarRatingComponent = ({ rating }) => {
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<Ionicons key={i} name="star" size={10} color={"#444"} />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={10} color={"#444"} />);
            }
        }
        return stars;
    };

    return (
        <View className='flex-row'>
            {renderStars()}
        </View>
    );
};

export default StarRatingComponent;
