import {useEffect} from 'react'
import {isEmpty} from 'lodash'
import cache from '../services/cache'

export const useNullCache = () => {
    useEffect(() => {
        (async () => {
            await cache.clearAll();
            const _cache = await cache.getAll();
            if(isEmpty(_cache)) {
                console.log('Cache was successfully deleted!')
            }
            else {
                console.error('An error has occurred with clearing cache')
            }
        })()

    }, [])
}
