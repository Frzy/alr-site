import { ActivityLog } from '@/types/common'
import { ACTIVITY_TYPE } from './constants'
import moment, { Moment } from 'moment'
import FuzzySearch from 'fuzzy-search'

type Filter = (log: ActivityLog) => boolean
export type TotalStats = {
  hours: number
  miles: number
  events: number
  money: number
}
type Stats = { id: ACTIVITY_TYPE; name: ACTIVITY_TYPE } & TotalStats
type LogStats = { data: Stats[]; totals: TotalStats }

const BASE_STATE = {
  hours: 0,
  miles: 0,
  events: 0,
  money: 0,
}

export default class Logs {
  private logs: ActivityLog[]
  private _cache: ActivityLog[] | undefined
  private _statCache: LogStats | undefined
  private _filter!: ((log: ActivityLog) => boolean) | undefined
  private _minDate: Date
  private _maxDate: Date
  private _fuzzySearch: string = ''

  constructor(logs: ActivityLog[]) {
    this.logs = [...logs]
    this._minDate = new Date()
    this._maxDate = new Date()

    const dates = this.logs.map((l) => new Date(l.date).getTime())
    this._minDate = new Date(Math.min(...dates))
    this._maxDate = new Date(Math.max(...dates))
  }

  set filter(filter: Filter | undefined) {
    this._cache = undefined
    this._statCache = undefined

    this._filter = filter
  }
  get filter() {
    return this._filter
  }

  set fuzzySearch(term: string) {
    this._cache = undefined
    this._statCache = undefined

    this._fuzzySearch = term
  }
  get fuzzySearch() {
    return this._fuzzySearch
  }

  get entries() {
    if (!this._cache) {
      let logs = this.filter ? this.logs.filter(this.filter) : this.logs

      if (this.fuzzySearch) {
        const searcher = new FuzzySearch(logs, ['activityName', 'activityType'], { sort: true })

        logs = searcher.search(this.fuzzySearch)
      }

      this._cache = logs
    }

    return this._cache
  }
  get stats(): LogStats {
    if (!this._statCache) {
      let tHours = 0
      let tMiles = 0
      let tMoney = 0
      let tEvents = 0
      const eventBreakdown = {
        [ACTIVITY_TYPE.EVENT]: { ...BASE_STATE },
        [ACTIVITY_TYPE.MEETING]: { ...BASE_STATE },
        [ACTIVITY_TYPE.OTHER]: { ...BASE_STATE },
        [ACTIVITY_TYPE.RIDE]: { ...BASE_STATE },
      }

      this.entries.forEach((log) => {
        tHours += log?.hours ?? 0
        tMiles += log?.miles ?? 0
        tMoney += log?.monies ?? 0
        tEvents += 1

        eventBreakdown[log.activityType].hours += log?.hours ?? 0
        eventBreakdown[log.activityType].miles += log?.miles ?? 0
        eventBreakdown[log.activityType].money += log?.monies ?? 0
        eventBreakdown[log.activityType].events += 1
      })

      const data: Stats[] = []

      for (let key in eventBreakdown) {
        data.push({
          id: key as ACTIVITY_TYPE,
          name: key as ACTIVITY_TYPE,
          ...eventBreakdown[key as ACTIVITY_TYPE],
        })
      }

      this._statCache = {
        data,
        totals: {
          hours: tHours,
          miles: tMiles,
          events: tEvents,
          money: tMoney,
        },
      }
    }

    return this._statCache
  }
  get minDate(): Moment {
    return moment(this._minDate).startOf('day')
  }
  get maxDate(): Moment {
    return moment(this._maxDate).endOf('day')
  }
}
