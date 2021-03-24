import { makeAutoObservable } from 'mobx'

class Pickers {
    week = null
    second = null
    source = null
    sourceType = 'group'

    set(item, data) {
        this[item] = data
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Pickers()

