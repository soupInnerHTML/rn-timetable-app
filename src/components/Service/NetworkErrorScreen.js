import React from 'react';
import {View} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NetworkErrorScreen = () => {
    return (
        <View style={{
            flex: 1,
            zIndex: 3,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
            position: 'absolute',
        }}>
            <MaterialCommunityIcons name="access-point-network-off" size={128} color="#aaa" />
        </View>
    );
}

export default NetworkErrorScreen;
