import { makeAutoObservable } from 'mobx'
import { Text, Linking } from 'react-native';

class Schedule {
    tables = []
    call = []
    isPressed = false
    isReady = false
    modalVisible = false
    moodle = []

    set(item, data) {
        this[item] = data
    }

    moodleActions(payload) {
        const translate = (type) => {
            switch (type) {
                case 'task': return 'Задача'
                case 'meeting': return 'Встреча'
                case 'resource': return 'Ресурс'
                default: return type
            }
        }

        this.modalVisible = true

        this.moodle = payload.map(payload => [
            translate(payload.type),
            <Text
                style={{
                    color: '#2999F2',
                    margin: 6,
                    fontSize: 12
                }}
                onPress={() => Linking.openURL(payload.url)}
            >
                {payload.url}
            </Text>,
            `${dayjs(payload.date).format('DD.MM.YYYY')} ${payload.time}`
        ])
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Schedule()