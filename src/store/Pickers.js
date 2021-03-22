import { makeAutoObservable } from 'mobx'
// import entities from "./Entities";
// import cache from "../global/cache";
// import schedule from "./Schedule";

class Pickers {
    week = null
    second = null
    source = null
    sourceType = 'group'

    set(item, data) {
        this[item] = data
    }

    // async setList(data, item, type) {
    //     const translate = {
    //         group: 'Группы',
    //         teacher: 'Преподаватели',
    //         room: 'Аудитории'
    //     }
    //
    //     if (entities[type].preview) {
    //         this.second = entities[type].preview
    //     }
    //     else {
    //         const cached = await cache.get(translate[type])
    //         this.second = cached || data[0]?.name
    //     }
    //
    //     schedule.call = data
    //     this.source = item
    //     schedule.isReady = true
    //
    // }

    constructor() {
        makeAutoObservable(this)
    }
}

export default new Pickers()
