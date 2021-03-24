import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import schedule from '../../store/Schedule';
import {observer} from "mobx-react-lite";
import {runInAction} from "mobx";
import cache from '../../services/cache'

const NetworkStatus = observer(() => {
    const [isConnected, setIsConnected] = useState(true)
    const animHeightConn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        NetInfo.addEventListener(({isConnected}) => {

            setIsConnected(isConnected)

            Animated.spring(animHeightConn, {
                toValue: isConnected ? 23 : 5,
                delay: 500,
                useNativeDriver: true
            }).start();

            if(isConnected) {
                runInAction(() => schedule.sources = ['Группы', 'Преподаватели', 'Аудитории'])
            }

            else {
                cache.getAll().then(_cache => {
                    runInAction(() => {
                        schedule.sources = schedule.sources.filter(source => (
                            Object.keys(_cache).includes(source)
                        ))
                    })
                })
            }


        });
    }, [])

    return (
        <Animated.View style={{
            ...styles.noConn,
            opacity: Number(schedule.isInit), // 0 || 1
            translateY: animHeightConn,
            backgroundColor: isConnected ? '#28A745' : '#D93025' //green or red,
        }}>
            <Text style={styles.noConnInfo}>
                {isConnected ?
                    'Подключено' :
                    'Нет соединения. Доступны только кэшированные данные'
                }
            </Text>
        </Animated.View>
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
