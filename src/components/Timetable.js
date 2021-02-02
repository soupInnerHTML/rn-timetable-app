import {Row, Rows, Table} from "react-native-table-component";
import {StyleSheet,Text} from "react-native";
import React from 'react'
import getKey from 'lodash/uniqueId'

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

    return tables.map(table => (
            <Table
                style={ styles.table }
                borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}
                key={getKey()}
            >
                <Row data={ Object.keys(table).map(e => <Text style={styles.head}>{e}</Text>) }/>
                <Row data={tableHead} style={styles.heads} textStyle={styles.rows} { ...{flexArr} }/>

                <Rows { ...{flexArr} } data={ Object.values(table)[0] } textStyle={styles.rows}/>
            </Table>
        ))
};

//styles
const styles = StyleSheet.create({
    head: {
        backgroundColor: '#f1f8ff',
        textAlign: "center",
        fontSize: 16,
        paddingVertical: 8
    },
    heads: {
        height: 40,
        backgroundColor: '#f1f8ff'
    },
    rows: {
        margin: 6,
        fontSize: 12,
    },
    table: {
        marginVertical: 10,
    },
});
