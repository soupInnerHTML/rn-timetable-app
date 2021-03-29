import React, {useState} from 'react';
import schedule from "../../store/Schedule";
import {ScrollView, RefreshControl} from "react-native";
import app from '../../store/App'

const ScrollViewWithRefresh = (props) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true)
        app.setHandReload(true)
        await schedule.init()
        setRefreshing(false)
        app.setHandReload(false)
    }

    return (
        <ScrollView refreshControl={
            <RefreshControl
                {...{refreshing, onRefresh}}
            />
        }>
            {props.children}
        </ScrollView>
    );
};

export default ScrollViewWithRefresh;
