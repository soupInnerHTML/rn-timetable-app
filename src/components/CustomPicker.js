import React from 'react';
import { Picker, StyleSheet, View } from "react-native";
import getKey from 'lodash/uniqueId'
import entities from '../store/Entities'
import { observer } from 'mobx-react-lite'
import schedule from '../store/Schedule';
import cache from '../global/cache'
import pickers from '../store/Pickers';

export default observer(({ type, ...props }) => {

    const setList = async (data, item, type) => {
        const translate = {
            group: 'Группы',
            teacher: 'Преподаватели',
            room: 'Аудитории'
        }

        console.log(entities)

        if (entities[type].preview) {
            pickers.set('second', entities[type].preview)
        }
        else {
            const cached = await cache.get(translate[type])
            pickers.set('second', cached || data[0]?.name)
        }

        schedule.set('call', data)
        pickers.set('source', item)
        schedule.set('isReady', true)

    }

    // const {setList} = entities

    const changeHandler = async (item) => {
        const types = {
            'Группы': 'group',
            'Преподаватели': 'teacher',
            'Аудитории': 'room'
        }

        if (type === 'source') {
            console.log('source изменился')
            schedule.set('isReady', false)
            let entity = types[item]
            const current = entities[entity] || {}

            if (current.list) {
                setList(current.list, item, entity).then()
                // await cache.set(type, item)
                // const a = await cache.getAll()
                // return console.log(a)
            }

            const response = await fetch(`https://api.ptpit.ru/${current.endpoint}?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull`)
            const data = await response.json()
            setList(data, item, entity).then()
            entities.set(entity, 'list', data)
            // cache.set(type, item).then()
            // const a = await cache.getAll()
            // console.log(a)
        }
        if (type === 'date') {
            console.log('date изменился')
            props.setValue(item)
            // cache.set('date', item).then()
        }
        else {
            console.log(`${pickers.source} изменился`)
            if (entities[types[pickers.source]].list.map(e => e.name).includes(item)) {
                props.setValue(item)
                entities.set(types[pickers.source], 'preview', item)

                if(pickers.source !== schedule.pressedConfig?.source) {
                    cache.set(pickers.source, item).then()

                    const a = await cache.getAll()
                    console.log(a)
                }
            }
        }
    }

    return <View style={styles.input}>
        <Picker
            selectedValue={props.value}
            onValueChange={changeHandler}>
            {
                props.state.map(item => (
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
