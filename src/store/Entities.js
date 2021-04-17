import { makeAutoObservable, configure } from 'mobx'

configure({
    enforceActions: "never",
})

//TODO rename class Entity & Entities

class Entity {
    constructor(endpoint, list, preview) {
        this.list = list
        this.preview = preview
        this.endpoint = endpoint
    }
}

class Entities {
    group = new Entity('groups')
    teacher = new Entity('persons/teachers')
    room = new Entity('rooms')

    all = [this.group, this.teacher, this.room]

    set(entity, sub, data) {
        this[entity][sub] = data
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Entities()
