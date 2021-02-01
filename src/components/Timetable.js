import {Row, Rows, Table} from "react-native-table-component";
import {StyleSheet} from "react-native";
import React from 'react'
import getKey from 'lodash/uniqueId'

export default ({tables, isPressed}) => {
    const tableHead = ['#', 'Время', 'Предмет', 'Подгруппа', 'Препод', 'Каб.']
    const flexArr = [.4, 1, 2, 1, 1.3, .7]

    return tables.map(table => (
            <Table
                style={ styles[isPressed ? 'table' : 'hide'] }
                borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}
                key={getKey()}
            >
                <Row data={ Object.keys(table) } style={styles.head}/>
                <Row data={tableHead} style={styles.head} textStyle={styles.rows} { ...{flexArr} }/>

                <Rows { ...{flexArr} } data={ Object.values(table)[0] } textStyle={styles.rows}/>
            </Table>
        ))
};

//styles
const styles = StyleSheet.create({
    head: {
        height: 40,
        backgroundColor: '#f1f8ff'
    },
    rows: {
        margin: 6,
        fontSize: 12
    },
    table: {
        marginVertical: 10,
    },
    hide: {
        display: "none"
    }
});
