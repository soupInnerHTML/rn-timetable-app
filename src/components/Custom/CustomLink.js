import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CustomLink({ onPress, ...props }) {
    return (
        <TouchableOpacity activeOpacity={.7} {...{ onPress }}>
            <Text
                style={styles.link}
            >
                {props.children}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    link: {
        color: '#2999F2',
        margin: 6,
        fontSize: 12
    },
});