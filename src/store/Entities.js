import { makeAutoObservable } from 'mobx'

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

    set(entity, sub, data) {
        this[entity][sub] = data
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Entities()