import Vue from 'vue'
import firebase from '@/firebase'

const db = firebase.firestore()

// 組織
interface OrganizationState {
  ref: firebase.firestore.DocumentReference | null;
  // 有効か
  activated: boolean;
  // 所属するモデレーター
  moderatorIds: Array<string>;
  // 名称
  name: string;
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const state = {
  organizationsState: [],
}

const getters = {
  organizations: (state: any) => state.organizationsState,
  findOrganizationById: (state: any) => (id: string) => state.organizationsState.find((d: OrganizationState) => (d.ref || {}).id === id),
}

const mutations = {
  init: (state: any) => (
    state.organizationsState = []
  ),
  set: (state: any, payload: OrganizationState) => (
    state.organizationsState.push(payload)
  ),
  update: (state: any, payload: OrganizationState) => {
    const i: number = state.organizationsState.findIndex((v: OrganizationState) => v.ref === payload.ref)
    const organization: any = state.organizationsState[i]
    let key: keyof OrganizationState
    for (key in payload) {
      organization[key] = payload[key]
    }
    Vue.set(state.organizationsState, i, organization)
  },
  delete:(state: any, payload: OrganizationState) => {
    const i: number = state.organizationsState.findIndex((v: OrganizationState) => v.ref === payload.ref)
    Vue.delete(state.organizationsState, i)
  }
}

const actions = {
  async listOrganizations({commit}: any) {
    return await db.collection('organizations')
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        const d2: any = d1.data()
        d2.id = d1.id
        d2.ref = d1.ref
        d2.createdAt = d2.createdAt.toDate()
        d2.updatedAt = d2.updatedAt.toDate()
        commit('set', d2)
      })
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async listOrganizationsByModeratorId({commit}: any, payload: OrganizationState) {
    if (!payload.moderatorIds) return
    return await db.collection('organizations').where('moderatorIds', 'array-contains', payload.moderatorIds[0]).where('activated', '==', true)
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        const d2: any = d1.data()
        d2.id = d1.id
        d2.ref = d1.ref
        d2.createdAt = d2.createdAt.toDate()
        d2.updatedAt = d2.updatedAt.toDate()
        commit('set', d2)
      })
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async createOrganization({commit}: any, payload: OrganizationState) {
    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp()
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp()
    return await db.collection('organizations')
    .add(payload)
    .then(doc => {
      payload.ref = doc
      commit('set', payload)
      return payload
    })
    .catch(() => {
      commit('init')
      return null
    })
  },
  async updateOrganization({commit}: any, payload: OrganizationState) {
    if (!payload.ref) return
    return await db.doc(payload.ref.path)
    .update(Object.assign({
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, payload))
    .then(() => {
      commit('update', payload)
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async deleteOrganization({commit}: any, payload: OrganizationState) {
    if (!payload.ref) return
    return await db.doc(payload.ref.path)
    .delete()
    .then(() => {
      commit('delete', payload)
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}