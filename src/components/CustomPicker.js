import React, {useState, useEffect} from 'react';
import {Picker, StyleSheet, View} from "react-native";
import getKey from 'lodash/uniqueId'

export default React.memo(({state, cache, type, setCall, setReady, setValue, value, setSecond}) => {

    const changeHandler = async (item) => {
        if(type === 'source') {
            const endpoints = {
                'Группы': 'groups',
                'Преподаватели': 'persons/teachers',
                'Аудитории': 'rooms'
            }
            setReady(false)
            const response = await fetch(`https://api.ptpit.ru/${endpoints[item]}`)
            const data = await response.json()
            console.log(data)
            setCall(data)
            setSecond(data[0].name)
            setReady(true)
        }

        setValue(item)
        await cache.set(type, item)
        const a = await cache.getAll()
        console.log(a)
    }

    // useEffect(() => {
    //     (async () => {
    //         const _cache = await cache.get(type);
    //         if(_cache) {
    //             setValue(_cache)
    //         }
    //         else {
    //             cache.set(type, value);
    //         }
    //
    //     })()
    // }, [])

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
}, (prev, next) => {
    return JSON.stringify(prev) === JSON.stringify(next)
})

const styles = StyleSheet.create({
    input: {
        marginBottom: 10,
    }
});
