import React from 'react';
import {Modal, StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View} from "react-native";
import {Row, Table} from "react-native-table-component";
import {borderStyle, tabelStyles} from "../styles/table";


const CustomModal = ({modalVisible, moodle, setModalVisible}) => {
    const tableHead = [
        'Тип',
        'Ссылка',
        'Дата',
    ]
    const flexArr = [.5, 1, .6]

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View>
                            <Table
                                style={styles.table}
                                {...{borderStyle}}
                            >
                                <Row {...{flexArr}} data={ tableHead } style={styles.heads} textStyle={styles.rows} />

                                <Row {...{flexArr}} data={ Object.values(moodle) } textStyle={styles.rows}/>
                            </Table>

                            <TouchableHighlight
                                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Закрыть</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 6
    },
    modalView: {
        width: '100%',
        backgroundColor: "white",
        borderRadius: 20,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    ...tabelStyles
});

export default CustomModal;
