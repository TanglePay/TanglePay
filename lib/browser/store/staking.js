import { useContext, useEffect, useState } from 'react'
import { IotaSDK, API_URL } from '../common'
import { StoreContext } from './context'
import { useGetNodeWallet } from './common'
import _uniqWith from 'lodash/uniqWith'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
export const initState = {
    events: [],
    config: { airdrops: [], filter: [], rewards: {} },
    historyList: [],
    statedTokens: [],
    statedAmount: 0,
    stakedRewards: {},
    forceRequest: 0 //force data sync indicator
}
export const reducer = (state, action) => {
    let { type, data } = action
    switch (type) {
        case 'historyList': {
            const list = data || []
            let statedTokens = []
            let statedAmount = 0
            let eventIds = {}
            const lastData = list[list.length - 1] || {}
            let lastAddress = lastData.address || ''
            if (lastData.type !== 3) {
                statedAmount = lastData.amount || 0
            }
            list.forEach((e) => {
                const { tokens } = e
                tokens.forEach((d) => {
                    const { eventId } = d
                    if (!eventIds[eventId]) {
                        statedTokens.push({
                            ...d
                        })
                    }
                    eventIds[eventId] = 1
                })
            })
            statedTokens = statedTokens.map((e) => {
                e.address = lastAddress
                return { ...e }
            })
            return { ...state, [type]: list, statedTokens, statedAmount }
        }
    }
    return { ...state, [type]: data }
}
export const useGetEventsConfig = () => {
    const { _, dispatch } = useContext(StoreContext)
    useEffect(() => {
        fetch(`${API_URL}/events.json`)
            .then((res) => res.json())
            .then((res) => {
                const airdrops = res?.airdrops || []
                const filter = res?.filter || []
                const rewards = res?.rewards || {}
                dispatch({
                    type: 'staking.config',
                    data: { airdrops, filter, rewards }
                })
            })
            .catch((err) => console.log(err))
    }, [])
}

export const useGetParticipationEvents = () => {
    // const [curWallet] = useGetNodeWallet();
    const { store } = useContext(StoreContext)
    const curNodeId = _get(store, 'common.curNodeId')
    const { filter } = _get(store, 'staking.config')
    const [eventInfo, setInfo] = useState({})
    useEffect(() => {
        const getData = async () => {
            let datas = await IotaSDK.getParticipationEvents()
            datas = datas.filter((e) => !filter.includes(e.id))
            const nowTime = parseInt(new Date().getTime() / 1000)
            datas.sort((a, b) => b.milestoneIndexCommence - a.milestoneIndexCommence)
            const unPreList = datas.filter((e) => e.commenceTime > nowTime)
            if (unPreList.length > 1) {
                datas = datas.slice(unPreList.length - 1)
            }
            datas.sort((a, b) => a.milestoneIndexStart - b.milestoneIndexStart)
            const upcomingList = []
            const commencingList = []
            const endedList = []
            let info = {
                status: 0,
                list: [],
                upcomingList,
                commencingList,
                endedList
            }
            if (datas.length > 0) {
                // status：0-》Ended  1-》Upcoming ，2-》Commencing
                datas.forEach((e) => {
                    const { startTime, endTime } = e
                    if (nowTime < startTime) {
                        upcomingList.push({ ...e })
                    } else if (nowTime >= startTime && nowTime < endTime) {
                        commencingList.push({ ...e })
                    } else {
                        endedList.push({ ...e })
                    }
                })
                let status = 0
                if (commencingList.length > 0) {
                    status = 2
                } else if (upcomingList.length > 0) {
                    status = 1
                }
                info = {
                    status,
                    list: datas,
                    upcomingList,
                    commencingList,
                    endedList
                }
            }
            setInfo(info)
        }
        getData()
    }, [curNodeId])
    return [eventInfo, setInfo, filter]
}

export const useGetRewards = (address) => {
    const { store, dispatch } = useContext(StoreContext)
    const [rewards, setRewards] = useState({})
    const historyList = _get(store, 'staking.historyList')
    useEffect(() => {
        let timeHandler = null
        if (!address) {
            setRewards({})
        } else {
            const requestData = async () => {
                let addressList = historyList.map((e) => e.address)
                addressList = _uniqWith(addressList, _isEqual)
                const resList = await Promise.all(
                    addressList.map((e) => {
                        return IotaSDK.getAddressRewards(e)
                    })
                )
                const dic = {}
                if (resList.length > 0) {
                    resList.forEach((e) => {
                        for (const i in e) {
                            if (dic[i]) {
                                dic[i].amount += e[i].amount
                            } else {
                                dic[i] = { ...e[i] }
                            }
                        }
                    })
                }
                // const res = await IotaSDK.getAddressRewards(address)
                setRewards(dic)
                dispatch({
                    type: 'staking.stakedRewards',
                    data: dic
                })
            }
            requestData()
            timeHandler = setInterval(requestData, 10000)
        }
        return () => {
            clearInterval(timeHandler)
        }
    }, [address, historyList])
    return rewards
}
