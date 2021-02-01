import React, {useState, useEffect} from 'react';
import {Picker, StyleSheet, View} from "react-native";
import id from 'lodash/uniqueId'

const CustomPicker = ({state, cache, type}) => {
    const [value, setValue] = useState(state[0])

    const changeHandler = (item) => {
        setValue(item)
        cache.set(type, item);
    }

    useEffect(() => {
        (async () => {
            const _cache = await cache.get(type);
            _cache && setValue(_cache)
        })()
    }, [])

    return <View style={styles.input}>
        <Picker
            selectedValue={value}
            onValueChange={changeHandler}>
            {
                state.map(item => (
                    <Picker.Item key={id()} label={item} value={item} />
                ))
            }
        </Picker>
    </View>
};

const styles = StyleSheet.create({
    input: {
        // borderBottomWidth: 1,
        // borderStyle: "solid",
        // borderColor: "#000",
        marginBottom: 10,
    }
});

export default CustomPicker;
