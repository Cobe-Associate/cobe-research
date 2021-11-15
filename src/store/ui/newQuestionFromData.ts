import firebase from '@/firebase'

interface NewQuestionFromDataState {
  questionRef: firebase.firestore.DocumentReference | null;
  questionBody: string;
}

const initialState: NewQuestionFromDataState = {
  questionRef: null,
  questionBody: ''
}

const state = {
  newQuestionFromDataState: initialState
}

const getters = {
  newQuestionFromData: (state: any) => state.newQuestionFromDataState
}

const mutations = {
  set: (state: any, payload: NewQuestionFromDataState) => (
    state.newQuestionFromDataState = payload
  )
}

const actions = {
  setNewQuestionFromData({commit}: any, payload: NewQuestionFromDataState) {
    commit('set', payload)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}