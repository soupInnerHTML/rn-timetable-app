import React, {useState} from 'react';
import {RefreshControl} from "react-native";
import schedule from "../../store/Schedule";
import {observer} from "mobx-react-lite";

const Refresh = observer(() => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true)
        await schedule.init()
        setRefreshing(false)
    }

    return (
        <RefreshControl
            {...{refreshing, onRefresh}}
        />

    );
});

export default Refresh;
