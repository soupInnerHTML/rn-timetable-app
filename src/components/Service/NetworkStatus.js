import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import schedule from '../../store/Schedule';
import {observer} from "mobx-react-lite";
import {runInAction} from "mobx";
import cache from '../../services/cache'
import app from '../../store/App'
import NetworkErrorScreen from "./NetworkErrorScreen";

const NetworkStatus = observer(() => {
    const [isConnected, setIsConnected] = useState(true)
    const animHeightConn = useRef(new Animated.Value(23)).current;

    useEffect(() => {
        NetInfo.addEventListener(({isConnected}) => {

            setIsConnected(isConnected)

            Animated.spring(animHeightConn, {
                toValue: isConnected ? 23 : 5,
                delay: 500,
                useNativeDriver: true
            }).start();


            if(isConnected) {
                app.isDisconnectWithoutCache = false
                runInAction(() => schedule.sources = ['Группы', 'Преподаватели', 'Аудитории'])
            }

            else {
                cache.getAll().then(_cache => {
                    runInAction(() => {
                        schedule.sources = schedule.sources.filter(source => (
                            Object.keys(_cache).includes(source)
                        ))

                        if(!_cache.pressed) {
                            app.isDisconnectWithoutCache = true
                        }
                    })
                })
            }


        });
    }, [])

    return (
        <>
            <Animated.View style={{
                ...styles.noConn,
                translateY: app.isInit ? animHeightConn : 23, // 23 === hide, 5 === show
                backgroundColor: isConnected ? '#28A745' : '#D93025' //green or red,
            }}>
                <Text style={styles.noConnInfo}>
                    {isConnected ?
                        'Подключено' :
                        'Нет соединения' + (!app.isDisconnectWithoutCache ? '. Доступны только кэшированные данные' : '')
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
