import React, { useState, useEffect } from 'react';
import { Picker, StyleSheet, View } from "react-native";
import getKey from 'lodash/uniqueId'

export default React.memo(({ state, cache, type, setCall, setReady, setValue, value, setSecond, ...props }) => {

    const [groupList, setGroupList] = useState(null)
    const [teacherList, setTeacherList] = useState(null)
    const [roomList, setRoomList] = useState(null)

    const [groupPreview, setGroupPreview] = useState(null)
    const [teacherPreview, setTeacherPreview] = useState(null)
    const [roomPreview, setRoomPreview] = useState(null)

    const getPreviews = (item) => {
        const prevs = {
            group: [groupPreview, setGroupPreview],
            teacher: [teacherPreview, setTeacherPreview],
            room: [roomPreview, setRoomPreview],
            source: [null, () => { }]
        }
        return prevs[item]
    }

    useEffect(() => {
        console.log([groupPreview, teacherPreview, roomPreview])
    }, [groupPreview, teacherPreview, roomPreview])

    const setList = async (data, item, type) => {
        setSecond(getPreviews(type)[0] || data[0].name)
        setCall(data)
        props.setSource(item)
        // const cachedPreview = await cache.get(type);
        // console.log(cachedPreview)
        setReady(true)
    }

    const changeHandler = async (item) => {
        const types = {
            'Группы': 'group',
            'Преподаватели': 'teacher',
            'Аудитории': 'room'
        }

        if (type === 'source') {

            const endpoints = {
                'Группы': 'groups',
                'Преподаватели': 'persons/teachers',
                'Аудитории': 'rooms'
            }

            const _state = {
                'Группы': [setGroupList, groupList],
                'Преподаватели': [setTeacherList, teacherList],
                'Аудитории': [setRoomList, roomList]
            }

            setReady(false)

            const currentList = _state[item]

            //get current list
            if (currentList[1]) {
                return setList(_state[item][1], item, types[item])
            }

            const response = await fetch(`https://api.ptpit.ru/${endpoints[item]}?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull`)
            const data = await response.json()
            setList(data, item, types[item])
            currentList[0](data) //set current list
        }

        // console.log(type, item)
        setValue(item)
        getPreviews(types[type] || type)[1](item)
        await cache.set(types[type] || type, item)
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
