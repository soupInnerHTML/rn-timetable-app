import { makeAutoObservable } from 'mobx'

class App {
    isReady = false
    isHandReload = false
    isInit = false
    isDisconnectWithoutCache = false

    setReady(flag) {
        this.isReady = flag
    }

    setHandReload(flag) {
        this.isHandReload = flag
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new App()
