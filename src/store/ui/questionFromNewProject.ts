import firebase from '@/firebase'

interface QuestionFromNewProjectState {
  questionRef: firebase.firestore.DocumentReference | null;
  willUpdate: boolean;
}

const initialState: QuestionFromNewProjectState = {
  questionRef: null,
  willUpdate: false,
}

const state = {
  questionFromNewProjectState: initialState
}

const getters = {
  questionFromNewProject: (state: any) => state.questionFromNewProjectState
}

const mutations = {
  set: (state: any, payload: QuestionFromNewProjectState) => (
    state.questionFromNewProjectState = payload
  )
}

const actions = {
  setQuestionFromNewProject({commit}: any, payload: QuestionFromNewProjectState) {
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