import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    StyleSheet,
    ScrollView,
    Button,
    SafeAreaView,
    View,
    ActivityIndicator,
} from 'react-native';
import { useNullCache } from "./src/hooks/useNullCache";
import { observer } from 'mobx-react-lite'
import CustomPicker from "./src/components/CustomPicker";
import Timetable from "./src/components/Timetable";
import CustomModal from "./src/components/CustomModal";
import schedule from './src/store/Schedule';
import cache from './src/global/cache'
import pickers from './src/store/Pickers';
import sources from './src/global/sources'
import weeks from './src/global/weeks'

export default observer(() => {

    const { call, isPressed, isReady } = schedule
    const { week, second, source, sourceType } = pickers

    useEffect(() => {
        schedule.init()
    }, [])

    const set = entity => value => pickers.set(entity, value)

    // dev check null cache cases
    // useNullCache(cache)
    // TODO delete in production

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={[styles.inner, isReady ? {} : styles.hide]}>
                    <StatusBar style="default" backgroundColor={'#fff'} />

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

                    <Button title={"Посмотреть"} onPress={() => {
                        schedule.getTimetable()
                        const {source, week, second} = pickers
                        schedule.pressedConfig = {
                            source, week, second
                        }
                        cache.set('pressed', {
                            source, week, second
                        })
                    }} />

                    {isPressed && <Timetable />}

                    <CustomModal />
                </View>

                <View style={[styles.loader, isReady ? styles.hide : {}]}>
                    <StatusBar style="default" backgroundColor={'#fff'} />
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
    text: {
        fontSize: 100,
        color: "#000"
    },
    hide: {
        display: 'none'
    }
});
