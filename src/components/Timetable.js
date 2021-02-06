import {Row, Rows, Table} from "react-native-table-component";
import {StyleSheet, Text, View} from "react-native";
import React from 'react'
import getKey from 'lodash/uniqueId'
import { Entypo } from '@expo/vector-icons';
import {borderStyle, tabelStyles} from "../styles/table";

export default ({tables,}) => {
    const tableHead = [
        '#',
        'Время',
        'Предмет',
        'Подгруппа',
        'Препод',
        'Каб.'
    ]
    const flexArr = [.4, 1, 2, 1, 1.3, .7]

    if(tables.length) {
        return tables.map(table => (
            <Table
                style={ styles.table }
                {...{borderStyle}}
                key={getKey()}
            >
                <Row data={ Object.keys(table).map(e => <Text style={styles.head}>{e}</Text>) }/>
                <Row data={tableHead} style={styles.heads} textStyle={styles.rows} { ...{flexArr} }/>

                <Rows { ...{flexArr} } data={ Object.values(table)[0] } textStyle={styles.rows}/>
            </Table>
        ))
    }

    else {
        return (
            <View style={styles.info}>
                <Entypo name="info-with-circle" size={32} color="#2999F2" />
                <Text style={styles.infoMessage}>Расписание на эту неделю остуствует</Text>
            </View>
        )
    }
};

//styles
const styles = StyleSheet.create({
    head: {
        backgroundColor: '#f1f8ff',
        textAlign: "center",
        fontSize: 16,
        paddingVertical: 8
    },
    ...tabelStyles,
    info: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50
    },
    infoMessage: {
        fontSize: 16,
        marginTop: 10,
    }
});
