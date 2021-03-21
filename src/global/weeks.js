import dayjs from 'dayjs'

//scope (3 weeks) for current date
const curr = dayjs()
const last = curr.subtract(7, 'day')
const next = curr.add(7, 'day')

const all = [last, curr, next].map(week => [
    week.startOf('week'),
    week.endOf('week'),
])

const weeks = all.map(
    week => week.map(date => date.add(1, 'day').format('DD.MM.YYYY')).join` - `
)

export default weeks