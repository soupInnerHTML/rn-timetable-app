import 'dayjs/locale/ru'
import { makeAutoObservable } from 'mobx'
import pickers from '../store/Pickers'
import dayjs from 'dayjs'
import cache from '../global/cache'
import sources from '../global/sources'
import weeks from '../global/weeks'
import entities from '../store/Entities'

class Schedule {
    tables = []
    call = []
    isPressed = false
    isReady = false
    modalVisible = false
    moodle = []

    set(item, data) {
        this[item] = data
    }

    async init() {

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

        const types = {
            'Группы': 'group',
            'Преподаватели': 'teacher',
            'Аудитории': 'room'
        }

        const _cache = await cache.getAll()
        const _source = _cache.source?.value || sources[0]
        const _week = _cache.date?.value || weeks[1]
        const _second = _cache[_source]?.value;

        console.log(_cache);

        [['week', _week], ['second', _second], ['source', _source]].forEach(items => pickers.set(...items))

        const response = await fetch(baseEndpoints[_source])
        const _call = await response.json()

        this.call = _call
        entities.set(types[_source], 'list', _call)

        _cache.pressed?.value ? this.getTimetable() : this.isReady = true
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

    async getTimetable() {
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

            const inputs = {
                id: this.call.find(item => item.name === (pickers.second)).id,
                week: pickers.week.split(' - ')[0].split('.').reverse().join('-')
            }

            const paths = {
                'Группы': `https://api.ptpit.ru/timetable/groups/${inputs.id}/${inputs.week}`,
                'Преподаватели': `https://api.ptpit.ru/timetable/teachers/${inputs.id}/${inputs.week}`,
                'Аудитории': `https://api.ptpit.ru/rooms/${inputs.id}/timetable/${inputs.week}`
            }

            const dates = new Set()
            const response = await fetch(paths[pickers.source])
            const json = await response.json();
            json.forEach(pair => {
                dates.add(pair.date)
            })

            const tables = Array.from(dates).map(date => {
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
                                pair.teacher_surname && `${pair.teacher_surname} ${pair.teacher_name[0]}.${pair.teacher_secondname[0]}.`,
                                pair.room_name
                            ]
                        })
                }
            })

            this.tables = tables
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