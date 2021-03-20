import { Cache } from "react-native-cache";
import { AsyncStorage } from 'react-native'

export default new Cache({
    namespace: "myapp",
    policy: {
        maxEntries: 50000
    },
    backend: AsyncStorage
});