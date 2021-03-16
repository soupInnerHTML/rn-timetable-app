import React, { useState, useEffect } from 'react';
import { Picker, StyleSheet, View } from "react-native";
import getKey from 'lodash/uniqueId'
import entities from '../store/Entities'
import { observer } from 'mobx-react-lite'

export default observer(({ state, cache, type, setCall, setReady, setValue, value, setSecond, ...props }) => {

    const setList = async (data, item, type) => {
        setSecond(entities[type].preview || data[0]?.name)
        setCall(data)
        props.setSource(item)

        setReady(true)
    }

    const changeHandler = async (item) => {
        const types = {
            'Группы': 'group',
            'Преподаватели': 'teacher',
            'Аудитории': 'room'
        }

        let entity = types[type] || type

        if (type === 'source') {

            setReady(false)

            entity = types[item]
            const current = entities[entity] || {}

            if (current.list) {
                return setList(current.list, item, entity)
            }

            const response = await fetch(`https://api.ptpit.ru/${current.endpoint}?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull`)
            const data = await response.json()
            setList(data, item, entity)
            entities.set(entity, 'list', data)
            return cache.set(type, item)
        }

        setValue(item)
        console.log(item, type)
        entities.set(entity, 'preview', item)
        await cache.set(entity, item)
        const a = await cache.getAll()
        console.log(a)
    }

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
});

const styles = StyleSheet.create({
    input: {
        marginBottom: 10,
    }
});
