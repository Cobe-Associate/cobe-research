import Vue from 'vue'
import firebase from '@/firebase'

const db = firebase.firestore()

// 調査のタイムライン
interface ResearchTimeline {
  ref: firebase.firestore.DocumentReference;
  // 回答参照
  answerRef: firebase.firestore.DocumentReference | null;
  // 回答種別
  answerType: string | null; // [text, radio, checkbox, slider, matrixRadio, matrixCheckbox]
  // 回答終了
  endOfAnswer: boolean;
  // メッセージ
  message: string | null;
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference;
  // 質問参照
  questionRef: firebase.firestore.DocumentReference | null;
  // タイムライン種別
  type: string; // [message, normal, question, answer]
  // 投稿したモデレーターのID
  senderId: string;
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const state = {
  researchTimelinesState: [],
  lastAnswerOfTimelinesState: {},
  subscribedResearchTimelineState: {},
}

const getters = {
  researchTimelines: (state: any) => state.researchTimelinesState,
  lastAnswerOfTimelines: (state: any) => state.lastAnswerOfTimelinesState,
  subscribedResearchTimeline: (state: any) => state.subscribedResearchTimelineState,
}

const mutations = {
  init: (state: any) => (
    state.researchTimelinesState = []
  ),
  set: (state: any, payload: ResearchTimeline) => (
    state.researchTimelinesState.push(payload)
  ),
  update: (state: any, payload: ResearchTimeline) => {
    const i = state.researchTimelinesState.findIndex((d: ResearchTimeline) => d.ref.id === payload.ref.id)
    if (i !== -1) {
      const researchTimeline: any = state.researchTimelinesState[i]
      let key: keyof ResearchTimeline
      for (key in payload) {
        researchTimeline[key] = payload[key]
      }
      Vue.set(state.researchTimelinesState, i, researchTimeline)
      if (payload.type === 'answer' && state.lastAnswerOfTimelinesState.ref && state.lastAnswerOfTimelinesState.ref.id === payload.ref.id) {
        const researchTimeline: any = state.lastAnswerOfTimelinesState
        let key: keyof ResearchTimeline
        for (key in payload) {
          researchTimeline[key] = payload[key]
        }
        state.lastAnswerOfTimelinesState = researchTimeline
      }
    }
  },
  setWithLastAnswer: (state: any, payload: ResearchTimeline) => {
    const i = state.researchTimelinesState.findIndex((d: ResearchTimeline) => d.ref.id === payload.ref.id)
    if (i === -1) {
      state.researchTimelinesState.push(payload)
      if (payload.type === 'answer') {
        state.lastAnswerOfTimelinesState = payload
      }
    }
  },
  setSubscribedResearchTimeline: (state: any, payload: ResearchTimeline) => (
    state.subscribedResearchTimelineState = payload
  )
}

const actions = {
  async listResearchTimelines({commit}: any, payload: ResearchTimeline) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('researchTimelines').orderBy('createdAt')
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
  async createResearchTimeline({commit}: any, payload: ResearchTimeline) {
    if (!payload.projectRef) {
      return
    }
    payload.senderId = (firebase.auth().currentUser || {}).uid || ''
    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp()
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp()
    return await db.doc(payload.projectRef.path).collection('researchTimelines')
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
  async updateResearchTimeline({commit}: any, payload: ResearchTimeline) {
    if (!payload.ref) return
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp()
    return await db.doc(payload.ref.path)
    .update(payload)
    .then(() => {
      commit('update', payload)
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async subscribeLastResearchTimeline({commit}: any, payload: ResearchTimeline) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('researchTimelines')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .onSnapshot(doc => {
      if (doc.docs[0]) {
        const d: any = doc.docs[0].data()
        // createResearchTimeline したモデレーターは2回 onSnapshot が呼ばれるので1回目を無視
        if (d.createdAt && d.updatedAt) {
          d.ref = doc.docs[0].ref
          d.createdAt = d.createdAt.toDate()
          d.updatedAt = d.updatedAt.toDate()
          commit('setWithLastAnswer', d)
        }
      }
      return true
    })
  },
  async unsubscribeResearchTimelines({commit}: any, unsubscribe: any) {
    return await unsubscribe()
    commit()
  },
  async subscribeResearchTimeline({commit}: any, payload: ResearchTimeline) {
    if (!payload.projectRef || !payload.ref) return
    return await db.doc(payload.projectRef.path).collection('researchTimelines').doc(payload.ref.id)
    .onSnapshot(doc => {
      const d: any = doc.data()
      d.ref = doc.ref
      d.createdAt = d.createdAt.toDate()
      d.updatedAt = d.updatedAt.toDate()
      commit('setSubscribedResearchTimeline', d)
      return true
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