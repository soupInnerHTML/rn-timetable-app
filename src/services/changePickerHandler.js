import entities from "../store/Entities";
import pickers from "../store/Pickers";
import cache from "./cache";
import schedule from "../store/Schedule";

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
        const _preview = cached || data[0]?.name

        pickers.set('second', _preview)
        entities.set(type, 'preview', _preview)
    }

    schedule.set('call', data)
    pickers.set('source', item)
    schedule.set('isReady', true)

}

// const {setList} = entities

const changePickerHandler = (type, setValue) => async (item) => {
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
        const a = await cache.getAll()
        console.log(a)

        console.log(entities)
    }
    if (type === 'date') {
        console.log('date изменился')
        setValue(item)
        // cache.set('date', item).then()
    }
    else {
        console.log(`${pickers.source} изменился`)
        if (entities[types[pickers.source]].list.map(e => e.name).includes(item)) {
            setValue(item)
            entities.set(types[pickers.source], 'preview', item)

            if(pickers.source !== schedule.pressedConfig?.source) {
                cache.set(pickers.source, item).then()

                const a = await cache.getAll()
                console.log(a)
            }
        }
    }
}

export default changePickerHandler
