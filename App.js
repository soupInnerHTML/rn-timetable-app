import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Picker, ScrollView, Button } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';

export default function App() {

    const tableHead = ['Head', 'Head2', 'Head3', 'Head4']
    const tableData = [
        ['1', '2', '3', '4'],
        ['a', 'b', 'c', 'd'],
        ['1', '2', '3', '456\n789'],
        ['a', 'b', 'c', 'd']
    ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Picker style={styles.input}>
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" />
        </Picker>
        <Picker style={styles.input}>
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" />
        </Picker>

        <Button title={"Посмотреть"} />

        <Table style={styles.table} borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
            <Row data={tableHead} style={styles.head} textStyle={styles.rows}/>
            <Rows data={tableData} textStyle={styles.rows}/>
        </Table>

        <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 50,
        marginHorizontal: 10,
    },
    text: {
        fontSize: 100,
        color: "#000"
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        marginBottom: 10,
        width: 300
    },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    rows: { margin: 6 },
    table: {
        marginVertical: 10
    }
});
