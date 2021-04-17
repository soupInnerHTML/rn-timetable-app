import 'dayjs/locale/ru'
import { makeAutoObservable } from 'mobx'
import dayjs from 'dayjs'
import cache from '../services/cache'
import sources from '../global/sources'
import weeks from '../global/weeks'
import types from '../global/pickerTypes'
import requestFilters from "../global/requestFilters";
import getListOf from "../utils/getListOf";
import entities from './Entities'
import pickers from './Pickers'
import app from './App'

class Schedule {
    tables = []
    call = []
    isPressed = false
    pressedConfig = {}
    modalVisible = false
    moodle = []
    sources = [...sources] //from import

    set(item, data) {
        this[item] = data
    }

    async init() {

        app.isReady = false

        const baseEndpoints = {
            'Группы': 'https://api.ptpit.ru/groups' + requestFilters,
            'Преподаватели': 'https://api.ptpit.ru/persons/teachers',
            'Аудитории': 'https://api.ptpit.ru/rooms'
        }

        const _cache = await cache.getAll();

        console.log(Object.values(_cache).map(c => Object.values(c)[1]))

        const getFromCache = item => _cache.pressed?.value[item] || _cache[item]?.value

        const _source = getFromCache('source') || sources[0]
        const _second = getFromCache(_source);
        let _week = getFromCache('week') || weeks[1]

        const dayOfWeek = dayjs().format('dddd')

        // switch week
        if (dayOfWeek === 'Sunday' && _week && !_cache.isClearedOnSunday) {
            console.log('clean date cache on Sunday')
            await cache.remove('pressed')
            await cache.set(_source, _second)

            _week = weeks[1]

            cache.set('isClearedOnSunday', true)
        }

        if(dayOfWeek !== 'Sunday') {
            cache.remove('isClearedOnSunday')
        }

        // console.log(_cache);

        [['week', _week], ['second', _second], ['source', _source]].forEach(items => {
            pickers.set(...items)
        });

        [
            ['group', _cache['Группы']],
            ['teacher', _cache['Преподаватели']],
            ['room', _cache['Аудитории']]
        ].forEach(items => {
            entities.set(items[0], 'preview', items[1]?.value || (entities[items[0]].list || [])[0])
            // preload previews from cache or from preloaded list
        });

        //is some list expired?
        sources.forEach(type => {
            const listOf = getListOf(type)
            const listOfFromCache = _cache[listOf] || {}

            if(dayjs().diff(listOfFromCache.created, 'day') >= 7) {
                cache.remove(listOf)
                console.log(type + ' is expired')
            }
            else {
                console.log(type + ' is not expired')
                entities.set(types[type],'list', listOfFromCache.value)
            }
        })

        // for clicked source
        const listOf = getListOf(_source)
        const listOfFromCache = _cache[listOf] || {}

        const fetchList = async () => {
            console.log('fetch list')
            const response = await fetch(baseEndpoints[_source])
            const _call = await response.json()

            this.call = _call
            entities.set(types[_source], 'list', _call)

            cache.set(listOf, _call).then()
        }

        const list = listOfFromCache.value

        console.log(list)

        if(list) {
            this.call = list
            entities.set(types[_source], 'list', list)
        }

        else {
            await fetchList()
        }

        this.pressedConfig = _cache.pressed?.value
        this.isPressed = !!this.pressedConfig

        if (this.isPressed) {
            await this.getTimetable(true)
        }
        else {
            app.isReady = true
        }

        setTimeout(() => app.isInit = true, 500)

        let isInCache = (e) => (
            Object.values(_cache).map(c => Object.values(c)[1]).includes(e.name)
        );

        console.log(_cache)
    }

    prep = async () => {
        this.getTimetable()
        const {source, week, second} = pickers
        this.pressedConfig = {
            source, week, second
        }
        cache.set('pressed', {
            source, week, second
        })

        cache.set(source, second)
    }

    moodleActions(payload) {
        const translate = (type) => {
            switch (type) {
                case 'task': return 'Задача'
                case 'meeting': return 'Встреча'
                case 'resource': return 'Ресурс'
                default: return type
            }
        }

        this.modalVisible = true

        this.moodle = payload.map(payload => [
            translate(payload.type),
            payload.url,
            `${dayjs(payload.date).format('DD.MM.YYYY')} ${payload.time}`
        ])
    }

    async getTimetable(isPreload) {
        try {

            const time = [
                '8:30\n10:05',
                '10:25\n12:00',
                '12:20\n14:10',
                '14:15\n15:50',
                '16:10\n17:55',
                '18:00\n19:35',
            ]

            this.isPressed = true
            app.isReady = false

            const targetFrom = item => isPreload ? this.pressedConfig[item] : pickers[item]

            const inputs = {
                id: this.call.find(item => item.name === targetFrom('second')).id,
                week: targetFrom('week').split(' - ')[0].split('.').reverse().join('-')
            }

            const paths = {
                'Группы': `https://api.ptpit.ru/timetable/groups/${inputs.id}/${inputs.week}`,
                'Преподаватели': `https://api.ptpit.ru/timetable/teachers/${inputs.id}/${inputs.week}`,
                'Аудитории': `https://api.ptpit.ru/rooms/${inputs.id}/timetable/${inputs.week}`
            }

            const dates = new Set()
            const response = await fetch(paths[targetFrom('source')])
            const json = await response.json();
            json.forEach(pair => {
                dates.add(pair.date)
            })

            this.tables = Array.from(dates).map(date => {
                const dayOfWeek = dayjs(date).locale('ru').format('dddd')
                const parseDate = `${dayOfWeek[0].toUpperCase() + dayOfWeek.slice(1)} (${dayjs(date).format('DD.MM')})`

                return {
                    [parseDate]: json.filter(e => e.date === date)
                        .map(pair => {
                            return [
                                pair.num,
                                time[pair.num - 1],
                                {
                                    moodle: pair.moodle,
                                    subject_name: pair.subject_name
                                },
                                pair.subgroup || '—',
                                pickers.source === 'Преподаватели' ? pair.group_name
                                : pair.teacher_surname && `${pair.teacher_surname} ${pair.teacher_name[0]}.${pair.teacher_secondname[0]}.`,
                                pickers.source === 'Аудитории' ? pair.group_name : pair.room_name
                            ]
                        })
                }
            })

            app.isReady = true
        }
        catch (e) {
            console.error(e)
            app.isReady = true
        }

    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Schedule()
