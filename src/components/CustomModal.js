import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View, Modal, Linking, TouchableOpacity } from "react-native";
import { Row, Rows, Table, TableWrapper } from "react-native-table-component";
import { borderStyle, tabelStyles } from "../global/table";
import schedule from '../store/Schedule';
import { observer } from 'mobx-react-lite'
import CustomLink from './CustomLink';

const CustomModal = observer(() => {
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
                visible={schedule.modalVisible}
                hardwareAccelerated
                onRequestClose={() => schedule.set('modalVisible', false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View onBlur={() => console.log(1)}>
                            <Table
                                style={styles.table}
                                {...{ borderStyle }}
                            >
                                <Row {...{ flexArr }} data={tableHead} style={styles.heads} textStyle={styles.rows} />

                                <TableWrapper style={styles.wrapper}>
                                    <Rows {...{ flexArr }} data={schedule.moodle.map((fields) => {
                                        return fields.map((field, i) => {

                                            return i === 1 ?
                                                <CustomLink onPress={() => Linking.openURL(field)}>
                                                    {field}
                                                </CustomLink>
                                                : field
                                        })
                                    })} textStyle={styles.rows} />
                                </TableWrapper>
                            </Table>

                            <TouchableOpacity
                                style={styles.openButton}
                                onPress={() => schedule.set('modalVisible', false)}
                                activeOpacity={.7}
                            >
                                <Text style={styles.textStyle}>Закрыть</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
});

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
        backgroundColor: "#2196F3",
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
    wrapper: { flexDirection: 'row' },
    ...tabelStyles
});

export default CustomModal;
