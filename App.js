import React, {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, ScrollView, Button, SafeAreaView, View, ActivityIndicator, AsyncStorage, TouchableOpacity, Text, Linking} from 'react-native';
import { Cache } from "react-native-cache";
import CustomPicker from "./src/components/CustomPicker";
import Timetable from "./src/components/Timetable";
import dayjs from 'dayjs'

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
        week => week.map( date => date.add(1, 'day').format('DD.MM.YYYY') ).join` - `
    )

    // variables
    const day = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    const time = [
        '8:30\n10:05',
        '10:25\n12:00',
        '12:20\n14:10',
        '14:15\n15:50',
        '16:10\n17:55',
        '18:00\n19:35',
    ]
    const cache = new Cache({
        namespace: "myapp",
        policy: {
            maxEntries: 50000
        },
        backend: AsyncStorage
    });

    // state
    const [tables, setTables] = useState([])
    const [groups, setGroups] = useState([])
    const [isPressed, setPress] = useState(false) //TODO delete?
    const [isReady, setReady] = useState(false)

    //effects
    useEffect(() => {
        (async () => {
            const response = await fetch('https://api.ptpit.ru/groups?filters=start_date:dlte:2/23/2021|end_date:dgte:1/23/2021|parent:isnull')
            const _groups = await response.json()
            setGroups(_groups)
            setReady(true)
        })()

    }, [])

    // check null cache
    // useEffect(() => {
    //     (async () => {
    //         await cache.clearAll();
    //         const _cache = await cache.getAll();
    //         console.log(_cache)
    //     })()
    //
    // }, [])


    const getTimetable = async () => {
        try {
            setPress(true)
            setReady(false)
            const _cache = await cache.getAll();
            const inputs = [
                groups.find(group => group.name === _cache.group.value).id,
                _cache.date.value.split(' - ')[0].split('.').reverse().join('-')
            ]
            console.log(inputs, _cache.date.value.split(' - ')[0])
            const dates = new Set()
            const response = await fetch(`https://api.ptpit.ru/timetable/groups/${inputs[0]}/${inputs[1]}`)
            const json = await response.json();

            json.forEach(pair => {
                dates.add(pair.date)
            })

            const tables = Array.from(dates).map((date, i) => {
                const parseDate =  `${day[i]} (${ dayjs(date).format('DD.MM') })`
                return {
                    [parseDate]: json.filter(e => e.date === date)
                        .map(pair => {
                            return [
                                pair.num,
                                time[pair.num - 1], //time
                                pair.moodle ? <TouchableOpacity activeOpacity={.7} onPress={() => Linking.openURL(JSON.parse(pair.moodle)[0].url)}>
                                    <Text style={styles.link}>
                                        {pair.subject_name}
                                    </Text>
                                </TouchableOpacity> : pair.subject_name,
                                pair.subgroup || '—',
                                `${pair.teacher_surname} ${pair.teacher_name[0]}.${pair.teacher_secondname[0]}.`,
                                //teacher
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
        cache, isReady
    }

    //UI
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                    {
                        isReady ?
                        <View style={styles.inner}>
                            <StatusBar style="auto" />
                            <CustomPicker state={weeks} {...pickerProps} type={'date'}/>
                            <CustomPicker state={groups.map(e => e.name)} {...pickerProps} type={'group'}/>
                            <Button title={"Посмотреть"} onPress={getTimetable}/>
                            {isPressed && <Timetable {...{tables}} />}
                        </View>
                            :
                        <View style={styles.loader}>
                            <StatusBar style="auto" />
                            <ActivityIndicator size="large" color="#2999F2" />
                        </View>
                    }
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
    }
});
