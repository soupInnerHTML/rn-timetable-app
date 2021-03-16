import 'dayjs/locale/ru'
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    StyleSheet,
    ScrollView,
    Button,
    SafeAreaView,
    View,
    ActivityIndicator,
    AsyncStorage,
    TouchableOpacity,
    Text,
    Linking
} from 'react-native';
import { Cache } from "react-native-cache";
import CustomPicker from "./src/components/CustomPicker";
import Timetable from "./src/components/Timetable";
import dayjs from 'dayjs'
import { useNullCache } from "./src/hooks/useNullCache";
import CustomModal from "./src/components/CustomModal";

export default () => {

    //scope (3 weeks) for current date
    const curr = dayjs()
    const last = curr.subtract(7, 'day')
    const next = curr.add(7, 'day')

    const all = [last, curr, next].map(week => [
        week.startOf('week'),
        week.endOf('week'),
    ])

    const weeks = all.map(
        week => week.map(date => date.add(1, 'day').format('DD.MM.YYYY')).join` - `
    )

    // variables
    const time = [
        '8:30\n10:05',
        '10:25\n12:00',
        '12:20\n14:10',
        '14:15\n15:50',
        '16:10\n17:55',
        '18:00\n19:35',
    ]
    const sources = ['Группы', 'Преподаватели', 'Аудитории']

    const types = (type) => {
        switch (type) {
            case 'task': return 'Задача'
            case 'meeting': return 'Встреча'
            case 'resource': return 'Ресурс'
            default: return type
        }
    }
    const cache = new Cache({
        namespace: "myapp",
        policy: {
            maxEntries: 50000
        },
        backend: AsyncStorage
    });

    // state
    const [tables, setTables] = useState([])
    const [call, setCall] = useState([])
    const [isPressed, setPress] = useState(false)
    const [isReady, setReady] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [moodle, setMoodle] = useState([])

    const [week, setWeek] = useState(null)
    const [second, setSecond] = useState('group')
    const [source, setSource] = useState('source')
    const [sourceType, setSourceType] = useState('group')

    //effects
    useEffect(() => {
        (async () => {
            // console.log('render')
            // reload cache on sunday
            if (curr.add(1, 'day').format('DD.MM.YYYY') === next.format('DD.MM.YYYY')) {
                await cache.remove('date')
            }

            const baseEndpoints = {
                'Группы': 'https://api.ptpit.ru/groups?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull',
                'Преподаватели': 'https://api.ptpit.ru/persons/teachers',
                'Аудитории': 'https://api.ptpit.ru/rooms'
            }

            const _cache = await cache.getAll()
            const _source = _cache.source?.value || sources[0]
            const _week = _cache.date?.value || weeks[1]
            const _second = _cache.group?.value

            console.log(_cache)

            setWeek(_week)
            setSecond(_second)
            setSource(_source)
            const response = await fetch(baseEndpoints[_source])
            const _call = await response.json()
            setCall(_call)
            _cache.pressed?.value ? getTimetable(_call, _week, _source, _second) : setReady(true)
        })()

        return () => console.log('unmount')

    }, [])


    const moodleActions = (payload) => {
        setModalVisible(true)

        const _moodle = payload.map(payload => [
            types(payload.type),
            <Text style={styles.link} onPress={() => Linking.openURL(payload.url)}>
                {payload.url}
            </Text>,
            `${dayjs(payload.date).format('DD.MM.YYYY')} ${payload.time}`
        ])
        setMoodle(_moodle)
    }

    // dev check null cache cases
    // useNullCache(cache)
    // TODO delete in production


    const getTimetable = async (_call, _week, _source, _second) => {
        try {
            setPress(true)
            setReady(false)
            const inputs = {
                id: (_call || call).find(item => item.name === (_second || second)).id,
                week: (_week || week).split(' - ')[0].split('.').reverse().join('-')
            }

            const paths = {
                'Группы': `https://api.ptpit.ru/timetable/groups/${inputs.id}/${inputs.week}`,
                'Преподаватели': `https://api.ptpit.ru/timetable/teachers/${inputs.id}/${inputs.week}`,
                'Аудитории': `https://api.ptpit.ru/rooms/${inputs.id}/timetable/${inputs.week}`
            }



            const dates = new Set()
            const response = await fetch(paths[(_source || source)])
            const json = await response.json();
            json.forEach(pair => {
                dates.add(pair.date)
            })

            const tables = Array.from(dates).map((date, i) => {
                const dayOfWeek = dayjs(date).locale('ru').format('dddd')
                const parseDate = `${dayOfWeek[0].toUpperCase() + dayOfWeek.slice(1)} (${dayjs(date).format('DD.MM')})`
                return {
                    [parseDate]: json.filter(e => e.date === date)
                        .map(pair => {
                            return [
                                pair.num,
                                time[pair.num - 1], //time
                                pair.moodle ? <TouchableOpacity activeOpacity={.7} onPress={() => moodleActions(JSON.parse(pair.moodle))}>
                                    <Text style={styles.link}>
                                        {pair.subject_name}
                                    </Text>
                                </TouchableOpacity> : pair.subject_name,
                                pair.subgroup || '—',
                                //фио
                                pair.teacher_surname && `${pair.teacher_surname} ${pair.teacher_name[0]}.${pair.teacher_secondname[0]}.`,
                                pair.room_name
                            ]
                        })
                }
            })

            setTables(tables)
            setReady(true)
        }
        catch (e) {
            console.error(e)
            setReady(true)
        }

    }

    //props
    const pickerProps = {
        cache,
    }

    //UI
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={[styles.inner, isReady ? {} : styles.hide]}>
                    <StatusBar style="default" backgroundColor={'#fff'} />

                    <CustomPicker
                        state={weeks}
                        {...pickerProps}
                        type={'date'}
                        setValue={setWeek}
                        value={week}
                    />

                    <CustomPicker
                        state={Array.isArray(call) ? call.map(e => e.name) : []}
                        {...pickerProps}
                        type={sourceType}
                        setValue={setSecond}
                        value={second}
                    />

                    <CustomPicker
                        state={sources}
                        {...pickerProps}
                        {...{ setCall, setReady, setSecond, setSource }}
                        type={'source'}
                        setValue={setSourceType}
                        value={source}
                    />
                    <Button title={"Посмотреть"} onPress={() => {
                        getTimetable()
                        cache.set('pressed', true)
                    }} />
                    {isPressed && <Timetable {...{ tables }} />}
                    <CustomModal {...{ modalVisible, moodle, setModalVisible }} />
                </View>

                <View style={[styles.loader, isReady ? styles.hide : {}]}>
                    <StatusBar style="default" backgroundColor={'#fff'} />
                    <ActivityIndicator size="large" color="#2999F2" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

//styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    inner: {
        marginTop: 50,
        marginHorizontal: 6,
    },
    loader: {
        marginTop: "75%",
    },
    text: {
        fontSize: 100,
        color: "#000"
    },
    link: {
        color: '#2999F2',
        margin: 6,
        fontSize: 12
    },
    hide: {
        display: 'none'
    }
});
