import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, StyleSheet, Text} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import schedule from '../../store/Schedule';
import {observer} from "mobx-react-lite";
import {runInAction} from "mobx";
import cache from '../../services/cache'
import app from '../../store/App'
import NetworkErrorScreen from "./NetworkErrorScreen";

const NetworkStatus = observer(() => {

    const scheduleMemo = useMemo(() => (
        [schedule.weeks, schedule.call, schedule.sources]
    ), [schedule.call.length > 0])

    const animHeightConn = useRef(new Animated.Value(23)).current;

    useEffect(() => {
        NetInfo.addEventListener(({isConnected}) => {

            runInAction(() => app.isDisconnect = !isConnected)

            Animated.spring(animHeightConn, {
                toValue: isConnected ? 23 : 5,
                delay: 500,
                useNativeDriver: true
            }).start();


            if(app.isDisconnect) {
                cache.getAll().then(_cache => {
                    if(!_cache.pressed) {
                        return app.isDisconnectWithoutCache = true
                    }

                    runInAction(() => {

                        const item = _cache.pressed.value

                        schedule.weeks = [item.week]
                        schedule.call = [{name: item.second}]
                        schedule.sources = [item.source]



                    })
                })
            }


            else {
                app.isDisconnectWithoutCache = false;
                [schedule.weeks, schedule.call, schedule.sources] = scheduleMemo.slice(0, 3)
            }



        });
    }, [])

    return (
        <>
            <Animated.View style={{
                ...styles.noConn,
                translateY: app.isInit ? animHeightConn : 23, // 23 === hide, 5 === show
                backgroundColor: !app.isDisconnect ? '#28A745' : '#D93025' //green or red,
            }}>
                <Text style={styles.noConnInfo}>
                    {app.isDisconnect ?
                        'Нет соединения' + (!app.isDisconnectWithoutCache ? '. Доступны только кэшированные данные' : '')
                        : 'Подключено'
                    }
                </Text>
            </Animated.View>

            {app.isDisconnectWithoutCache && <NetworkErrorScreen/> }
        </>
    );
});

const styles = StyleSheet.create({
    noConn: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        zIndex: 200
    },
    noConnInfo: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 5
    },
});

export default NetworkStatus;
