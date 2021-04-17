import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import schedule from '../../store/Schedule';
import {observer} from "mobx-react-lite";
import {runInAction} from "mobx";
import cache from '../../services/cache'
import app from '../../store/App'
import entities from '../../store/Entities'
import NetworkErrorScreen from "./NetworkErrorScreen";

const NetworkStatus = observer(() => {
    const [isConnected, setIsConnected] = useState(true)
    const [listsMemo, ] = useState(entities.all.map(e => e.list))

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
                entities.all.forEach((e, i) => e.list = listsMemo[i])

            }

            else {
                cache.getAll().then(_cache => {
                    if(!_cache.pressed) {
                        return app.isDisconnectWithoutCache = true
                    }

                    runInAction(() => {

                        schedule.sources = schedule.sources.filter(source => (
                            Object.keys(_cache).includes(source)
                        ))

                        let isInCache = (e) => (
                            Object.values(_cache).map(c => Object.values(c)[1]).includes(e.name)
                        );

                        console.log('__onNetworkErrorEarly__', entities.teacher.list)

                        schedule.call = schedule.call.filter(e => isInCache(e));

                        // entities.all.forEach(e => e.list ? e.list = e.list.filter(e => isInCache(e)) : '')

                        entities.teacher.list = [{name: _cache['Преподаватели'].value}]
                        entities.group.list = [{name: _cache['Группы'].value}]
                        entities.room.list = [{name: _cache['Аудитории'].value}]


                        // console.log('__onNetworkError__', entities.all.map(e => e.list))
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
