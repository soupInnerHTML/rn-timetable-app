import React from 'react';
import { Picker, StyleSheet, View } from "react-native";
import getKey from 'lodash/uniqueId'
import { observer } from 'mobx-react-lite'
import changePickerHandler from '../../services/changePickerHandler'

export default observer(({ type, ...props }) => {

    return <View style={styles.input}>
        <Picker
            selectedValue={props.value}
            onValueChange={changePickerHandler(type, props.setValue)}>
            {
                props.state.map(item => (
                    <Picker.Item key={getKey()} label={item} value={item} />
                ))
            }
        </Picker>
    </View>
});

const styles = StyleSheet.create({
    input: {
        marginBottom: 10,
    }
});
