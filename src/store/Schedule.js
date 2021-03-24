import 'dayjs/locale/ru'
import { makeAutoObservable } from 'mobx'
import pickers from '../store/Pickers'
import dayjs from 'dayjs'
import cache from '../services/cache'
import sources from '../global/sources'
import weeks from '../global/weeks'
import entities from '../store/Entities'
import types from '../global/pickerTypes'

class Schedule {
    tables = []
    call = []
    isPressed = false
    pressedConfig = {}
    isReady = false
    isInit = false
    modalVisible = false
    moodle = []
    sources = ['Группы', 'Преподаватели', 'Аудитории']

    set(item, data) {
        this[item] = data
    }

    async init() {

        this.isReady = false

        // clean date cache on sunday
        if (dayjs().format('dddd') === 'Sunday') {
            console.log('clean date cache on sunday')
            await cache.remove('date')
        }

        const baseEndpoints = {
            'Группы': 'https://api.ptpit.ru/groups?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull',
            'Преподаватели': 'https://api.ptpit.ru/persons/teachers',
            'Аудитории': 'https://api.ptpit.ru/rooms'
        }

        const _cache = await cache.getAll();

        const getFromCache = item => _cache.pressed?.value[item] || _cache[item]?.value

        const _source = getFromCache('source') || sources[0]
        const _week = getFromCache('date') || weeks[1]
        const _second = getFromCache(_source);

        console.log(_cache);

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

        const response = await fetch(baseEndpoints[_source])
        const _call = await response.json()

        this.call = _call
        entities.set(types[_source], 'list', _call)

        this.pressedConfig = _cache.pressed?.value
        this.isPressed = !!this.pressedConfig

        if (this.isPressed) {
            await this.getTimetable(true)
        }
        else {
            this.isReady = true
        }

        setTimeout(() => this.isInit = true, 500)
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
            this.isReady = false

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

            this.isReady = true
        }
        catch (e) {
            console.error(e)
            this.isReady = true
        }

    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Schedule()
