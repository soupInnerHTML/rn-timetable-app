import entities from "../store/Entities";
import pickers from "../store/Pickers";
import cache from "./cache";
import schedule from "../store/Schedule";
import types from '../global/pickerTypes'

const setList = async (data, item, type) => {

    //TODO integrate to pickerTypes.js
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

const changePickerHandler = (type, setValue) => async (item) => {
    switch (type) {
        case 'source':
            schedule.set('isReady', false)
            let entity = types[item]
            const current = entities[entity] || {}

            if (current.list) {
                setList(current.list, item, entity).then()
            }

            const response = await fetch(`https://api.ptpit.ru/${current.endpoint}?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull`)
            const data = await response.json()
            setList(data, item, entity).then()
            entities.set(entity, 'list', data)
            const a = await cache.getAll()
            console.log(a)

            console.log(entities)
            break

        case 'date': return setValue(item)

        default:
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

//TODO improve select & load logic
//Например: преподаватель вообще не кэшируется в `Преподаватели`
// при просмотре его расписания из-за __защиты__
