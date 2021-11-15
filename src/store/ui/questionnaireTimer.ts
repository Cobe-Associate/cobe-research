import { DateTime } from 'luxon'

interface QuestionnaireTimerState {
  countup: number;
  countdown: number;
  status: string;
}

const initialState: QuestionnaireTimerState = {
  countup: 0,
  countdown: 0,
  status: 'stop'
}

const state = {
  timerStatus: initialState
}

const getters = {
  questionnaireTimer: (state: any) => state.timerStatus,
  questionnaireTimerCountupDisplay: (state: any) => DateTime.fromSeconds(state.timerStatus.countup, {zone: 'utc'}).toFormat('HH:mm:ss'),
  questionnaireTimerCountdownDisplay: (state: any) => DateTime.fromSeconds(state.timerStatus.countdown, {zone: 'utc'}).toFormat('HH:mm:ss')
}

const mutations = {
  init: (state: any) => (
    state.timerStatus = initialState
  ),
  set: (state: any, payload: QuestionnaireTimerState) => (
    state.timerStatus = payload
  ),
  count: (state: any) => {
    state.timerStatus.countup += 1
    state.timerStatus.countdown -= 1
  }
}

const actions = {
  async startTimer({commit}: any, payload: QuestionnaireTimerState) {
    return await new Promise(resolve => {
      commit('set', {
        countup: payload.countup || 0,
        countdown: payload.countdown || 3600,
        status: 'start'
      })
      setInterval(() => {
        commit('count')
      }, 1000)
      resolve(true)
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