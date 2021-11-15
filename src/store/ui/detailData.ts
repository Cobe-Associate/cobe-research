import firebase from '@/firebase'

interface DetailDataState {
  answerRef: firebase.firestore.DocumentReference | null;
  questionRef: firebase.firestore.DocumentReference | null;
}

const initialState: DetailDataState = {
  answerRef: null,
  questionRef: null
}

const state = {
  detailDataStatus: initialState
}

const getters = {
  detailData: (state: any) => state.detailDataStatus
}

const mutations = {
  init: (state: any) => (
    state.detailDataStatus = initialState
  ),
  set: (state: any, payload: DetailDataState) => (
    state.detailDataStatus = payload
  )
}

const actions = {
  setDetailData({commit}: any, payload: DetailDataState) {
    commit('set', payload)
  },
  initDetailData({commit}: any) {
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