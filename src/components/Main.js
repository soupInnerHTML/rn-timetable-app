import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    ScrollView,
    Button,
    SafeAreaView,
    View,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useNullCache } from "../hooks/useNullCache";
import { observer } from 'mobx-react-lite'
import CustomPicker from "./Custom/CustomPicker";
import Timetable from "../components/Timetable";
import CustomModal from "./Custom/CustomModal";
import schedule from '../store/Schedule';
import pickers from '../store/Pickers';
import weeks from '../global/weeks'
import CustomStatusBar from "./Custom/CustomStatusBar";
import NetworkStatus from "./Service/NetworkStatus";

export default observer(() => {

    const { call, isPressed, isReady, sources } = schedule
    const { week, second, source, sourceType } = pickers

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true)
        await schedule.init()
        setRefreshing(false)
    }

    useEffect(() => {
        schedule.init()
    }, [])

    const set = entity => value => pickers.set(entity, value)

    // dev check null cache cases
    // () === false, (1) === true
    useNullCache()
    // TODO delete in production or refactor

    return (
        <SafeAreaView style={styles.container}>

            <NetworkStatus/>

            <ScrollView refreshControl={
                <RefreshControl
                    {...{refreshing, onRefresh}}
                />
            }>
                <View style={[styles.inner, isReady ? {} : styles.hide]}>
                    <CustomStatusBar/>

                    <CustomPicker
                        state={weeks}
                        type={'date'}
                        setValue={set('week')}
                        value={week}
                    />

                    <CustomPicker
                        state={Array.isArray(call) ? call.map(e => e.name) : []}
                        type={sourceType}
                        setValue={set('second')}
                        value={second}
                    />

                    <CustomPicker
                        state={sources}
                        type={'source'}
                        setValue={set('sourceType')}
                        value={source}
                    />

                    <Button title={"Посмотреть"} onPress={schedule.prep} />

                    {isPressed && <Timetable />}

                    <CustomModal />
                </View>

                <View style={[styles.loader, isReady ? styles.hide : {}]}>
                    <CustomStatusBar/>
                    <ActivityIndicator size="large" color="#2999F2" />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
})

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
    noConn: {
        backgroundColor: '#D93025',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        zIndex: 200
    },
    noConnInfo: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 12
    },
    infoMessage: {
        marginTop: 30,
        marginHorizontal: 50,
        textAlign: 'center',
        fontSize: 17
    },
    text: {
        fontSize: 100,
        color: "#000"
    },
    hide: {
        display: 'none'
    }
});
