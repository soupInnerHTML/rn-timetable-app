import React, {useState, useEffect} from 'react';
import {Picker, StyleSheet, View} from "react-native";
import getKey from 'lodash/uniqueId'

export default ({state, cache, isReady, type}) => {
    const [value, setValue] = useState(state[0])

    const changeHandler = async (item) => {
        setValue(item)
        await cache.set(type, item);
    }

    useEffect(() => {
        (async () => {
            const _cache = await cache.get(type);
            if(_cache) {
                setValue(_cache)
            }
            else {
                cache.set(type, value);
            }
            console.log(_cache)
        })()
    }, [value, isReady])

    return <View style={styles.input}>
        <Picker
            selectedValue={value}
            onValueChange={changeHandler}>
            {
                state.map(item => (
                    <Picker.Item key={getKey()} label={item} value={item} />
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
