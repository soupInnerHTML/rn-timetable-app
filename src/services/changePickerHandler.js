import entities from "../store/Entities";
import pickers from "../store/Pickers";
import cache from "./cache";
import schedule from "../store/Schedule";
import types from '../global/pickerTypes'
import requestFilters from "../global/requestFilters";
import getListOf from "../utils/getListOf";
import app from '../store/App'

const setList = async (data, item, type) => {

    //TODO integrate to pickerTypes.js
    const translate = {
        group: 'Группы',
        teacher: 'Преподаватели',
        room: 'Аудитории'
    }

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
    app.setReady(true)
}

const changePickerHandler = (type, setValue) => async (item) => {
    switch (type) {
        case 'source':
            app.setReady(false)
            let entity = types[item]
            const current = entities[entity] || {}

            if (current.list) {
                setList(current.list, item, entity)
            }

            else {
                const response = await fetch(`https://api.ptpit.ru/${current.endpoint}${requestFilters}`)
                const data = await response.json()
                setList(data, item, entity)
                entities.set(entity, 'list', data)

                await cache.set(getListOf(item), data)
                // const a = await cache.getAll()

                // console.log(a)
                // console.log(entities)
            }

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
