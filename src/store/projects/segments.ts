import Vue from 'vue'
import firebase from '@/firebase'

const db = firebase.firestore()

// セグメント
interface SegmentState {
  ref: firebase.firestore.DocumentReference;
  // セグメント名
  name: string;
  // 年齢
  age: Array<number>; // [18, 29], [30, 39], [40, 49], [50, 59], [60, 99]
  // 性別
  gender: number | null; // 1, 2, 9
  // 質問
  questions: Array<{(ref: string): firebase.firestore.DocumentReference | Array<string>}>;
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference;
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const state = {
  segmentsState: []
}

const getters = {
  segments: (state: any) => state.segmentsState,
  findSegment: (state: any) => (ref: firebase.firestore.DocumentReference) => state.segmentsState.find((d: SegmentState) => d.ref.id === ref.id),
  findSegmentById: (state: any) => (id: string) => state.segmentsState.find((d: SegmentState) => d.ref.id === id),
  findSegmentByQuestionRef: (state: any) => (questionRef: firebase.firestore.DocumentReference) => state.segmentsState.find((d: SegmentState) => d.questions.find((q: any) => q.ref.id === questionRef.id)),
}

const mutations = {
  init: (state: any) => (
    state.segmentsState = []
  ),
  set: (state: any, payload: SegmentState) => (
    state.segmentsState.push(payload)
  ),
  update: (state: any, payload: SegmentState) => {
    const i: number = state.segmentsState.findIndex((v: SegmentState) => v.ref === payload.ref)
    const segment: any = state.segmentsState[i]
    let key: keyof SegmentState
    for (key in payload) {
      segment[key] = payload[key]
    }
    Vue.set(state.segmentsState, i, segment)
  },
  delete:(state: any, payload: SegmentState) => {
    const i: number = state.segmentsState.findIndex((v: SegmentState) => v.ref === payload.ref)
    Vue.delete(state.segmentsState, i)
  }
}

const actions = {
  async listSegments({commit}: any, payload: SegmentState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('segments').orderBy('createdAt')
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        const d2: any = d1.data()
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
  async createSegment({commit}: any, payload: SegmentState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('segments')
    .add(Object.assign({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, payload))
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
  async updateSegment({commit}: any, payload: SegmentState) {
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
  async deleteSegment({commit}: any, payload: SegmentState) {
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