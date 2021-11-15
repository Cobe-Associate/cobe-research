import { DateTime } from 'luxon'

interface AnswerTimerState {
  answerId: string;
  countup: number;
  countdown: number;
  start: number;
  status: string;
}

const initialState: AnswerTimerState = {
  answerId: '',
  countup: 0,
  countdown: 0,
  start: 0,
  status: 'stop'
}

const state = {
  timerStatus: initialState
}

const getters = {
  answerTimer: (state: any) => state.timerStatus,
  answerTimerCountdownDisplay: (state: any) => DateTime.fromSeconds(state.timerStatus.countdown, {zone: 'utc'}).toFormat('HH:mm:ss'),
  answerTimerCountdownmmssDisplay: (state: any) => DateTime.fromSeconds(state.timerStatus.countdown, {zone: 'utc'}).toFormat('mm:ss'),
  answerTimerCountdownProgress: (state: any) => (1 - state.timerStatus.countdown / state.timerStatus.start) * 100
}

const mutations = {
  init: (state: any) => (
    state.timerStatus = initialState
  ),
  set: (state: any, payload: AnswerTimerState) => (
    state.timerStatus = payload
  ),
  count: (state: any) => {
    state.timerStatus.countup += 1
    state.timerStatus.countdown -= 1
  }
}

const actions = {
  async startTimer({commit}: any, payload: AnswerTimerState) {
    return await new Promise(resolve => {
      commit('set', {
        answerId: payload.answerId,
        countup: 0,
        countdown: payload.countdown,
        start: payload.countdown,
        status: 'start'
      })
      const timer = setInterval(() => {
        commit('count')
      }, 1000)
      setTimeout(() => {
        commit('init')
        clearInterval(timer)
        resolve(true)
      }, payload.countdown * 1000)
    })
  },
  async stopTimer({commit}: any) {
    commit('init')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}