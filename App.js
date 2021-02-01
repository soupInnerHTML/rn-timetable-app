import React, {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, ScrollView, Button, SafeAreaView, View, ActivityIndicator, AsyncStorage} from 'react-native';
import { Cache } from "react-native-cache";
import CustomPicker from "./src/components/CustomPicker";
import Timetable from "./src/components/Timetable";

export default () => {

    // variables
    const day = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    const weeks = [
        "25.01.2021 - 31.01.2021",
        "01.02.2021 - 07.02.2021",
        "08.02.2021 - 15.02.2021",
    ]
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
    const [isPressed, setPress] = useState(false)
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

    useEffect(() => {
        (async () => {
            const _cache = await cache.getAll();
            console.log(cache)
        })()

    }, [cache.toString()])


    const getTimetable = async () => {
        try {
            setReady(false)
            const _cache = await cache.getAll();
            const inputs = [
                groups.find(group => group.name === _cache.group.value).id,
                _cache.date.value.split(' - ')[0].split('.').reverse().join('-')
            ]
            console.log(inputs)
            const dates = new Set()
            const response = await fetch(`https://api.ptpit.ru/timetable/groups/${inputs[0]}/${inputs[1]}`)
            const json = await response.json();

            json.forEach(pair => {
                dates.add(pair.date)
            })

            const tables = Array.from(dates).map((date, i) => {
                const parseDate =  `${day[i]} (${date.slice(-5).split`-`.reverse().join`.`})`
                return {
                    [parseDate]: json.filter(e => e.date === date)
                        .map(pair => {
                            return [
                                pair.num,
                                time[pair.num - 1], //time
                                pair.subject_name,
                                pair.subgroup || 'Группа',
                                `${pair.teacher_surname} ${pair.teacher_name[0]}.${pair.teacher_secondname[0]}.`,
                                //teacher
                                pair.room_name
                            ]
                        })
                }
            })

            console.log(tables)
            setTables(tables)

            setPress(true)
            setReady(true)
        }
        catch (e) {
            console.log(e)
            setReady(true)
        }

    }

    //UI
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                    {
                        isReady ?
                        <View style={styles.inner}>
                            <StatusBar style="auto" />
                            <CustomPicker state={weeks} {...{cache}} type={'date'}/>
                            <CustomPicker state={groups.map(e => e.name)} {...{cache}} type={'group'}/>
                            <Button title={"Посмотреть"} onPress={getTimetable}/>
                            <Timetable {...{isPressed, tables}} />
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
        backgroundColor: '#fff'
    },
    inner: {
        marginTop: 50,
        marginHorizontal: 10,
    },
    loader: {
        marginTop: "75%",
    },
    text: {
        fontSize: 100,
        color: "#000"
    }
});
