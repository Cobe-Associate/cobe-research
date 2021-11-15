import firebase from '@/firebase'

interface SegmentFromNewProjectState {
  segmentRef: firebase.firestore.DocumentReference | null;
  willUpdate: boolean;
}

const initialState: SegmentFromNewProjectState = {
  segmentRef: null,
  willUpdate: false,
}

const state = {
  segmentFromNewProjectState: initialState
}

const getters = {
  segmentFromNewProject: (state: any) => state.segmentFromNewProjectState
}

const mutations = {
  set: (state: any, payload: SegmentFromNewProjectState) => (
    state.segmentFromNewProjectState = payload
  )
}

const actions = {
  setSegmentFromNewProject({commit}: any, payload: SegmentFromNewProjectState) {
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