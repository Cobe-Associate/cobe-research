interface OrganizationState {
  id: string;
  activated: boolean;
  moderatorIds: Array<string>;
  name: string;
}

const initialState: OrganizationState = {
  id: '',
  activated: false,
  moderatorIds: [],
  name: '',
}

const state = {
  organizationState: initialState
}

const getters = {
  organization: (state: any) => state.organizationState
}

const mutations = {
  init: (state: any) => (
    state.organizationState = initialState
  ),
  set: (state: any, payload: OrganizationState) => (
    state.organizationState = payload
  )
}

const actions = {
  setUiOrganization({commit}: any, payload: OrganizationState) {
    commit('set', payload)
  },
  initUiOrganization({commit}: any) {
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