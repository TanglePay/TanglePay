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
            list.forEach((e) => {
                const { tokens, amount, type } = e
                statedTokens = [...statedTokens, ...tokens]
                switch (type) {
                    case 1:
                    case 2:
                        statedAmount += parseFloat(amount)
                        break
                    case 3:
                        statedAmount -= parseFloat(amount)
                        break
                    default:
                        break
                }
            })
            statedTokens = _uniqWith(statedTokens, _isEqual)
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
    const [eventInfo, setInfo] = useState({})
    useEffect(() => {
        const getData = async () => {
            const datas = await IotaSDK.getParticipationEvents()
            const nowTime = parseInt(new Date().getTime() / 1000)
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
                    if (startTime > nowTime) {
                        upcomingList.push({ ...e })
                    } else if (startTime <= nowTime && endTime > nowTime) {
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
    return [eventInfo, setInfo]
}

export const useGetRewards = (address) => {
    const { _, dispatch } = useContext(StoreContext)
    const [rewards, setRewards] = useState({})
    useEffect(() => {
        let timeHandler = null
        if (!address) {
            setRewards({})
        } else {
            const requestData = async () => {
                const res = await IotaSDK.getAddressRewards(address)
                setRewards(res)
                dispatch({
                    type: 'staking.stakedRewards',
                    data: res
                })
            }
            requestData()
            timeHandler = setInterval(requestData, 10000)
        }
        return () => {
            clearInterval(timeHandler)
        }
    }, [address])
    return rewards
}
