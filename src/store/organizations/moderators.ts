//  モデレータ
interface ModeratorState {
  uid: string;
  email: string;
  password: string;
}

const state = {
  moderatorsState: [],
}

const getters = {
  moderators: (state: any) => state.moderatorsState,
}

const mutations = {
  init: (state: any) => (
    state.moderatorsState = []
  ),
  set: (state: any, payload: ModeratorState) => (
    state.moderatorsState.push(payload)
  ),
}

const actions = {
  async listModerators({commit}: any) {
    return await fetch(process.env.VUE_APP_FUNCTION_URL + '/users')
    .then(response => {
      if(!response.ok) {
        commit('init')
        return false
      }
      response.text().then(text => {
        const users = JSON.parse(text).users
        users.forEach((user: any) => {
          commit('set', user)
        })
      })
      return true
    })
  },
  async createModerator({commit}: any, payload: ModeratorState) {
    return await fetch(process.env.VUE_APP_FUNCTION_URL + '/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if(!response.ok) {
        response.text().then(text => {
          console.error(JSON.parse(text))
        })
        commit('init')
        return false
      }
      response.text().then(text => {
        commit('set', JSON.parse(text))
      })
      return true
    })
  },
  async updateModerator({commit}: any, payload: ModeratorState) {
    if (!payload.uid) return
    return await fetch(process.env.VUE_APP_FUNCTION_URL + '/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if(!response.ok) {
        response.text().then(text => {
          console.error(JSON.parse(text))
        })
        commit('init')
        return false
      }
      return true
    })
  },
  async deleteModerator({commit}: any, payload: ModeratorState) {
    if (!payload.uid) return
    return await fetch(process.env.VUE_APP_FUNCTION_URL + '/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if(!response.ok) {
        response.text().then(text => {
          console.error(JSON.parse(text))
        })
        commit('init')
        return false
      }
      return true
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}