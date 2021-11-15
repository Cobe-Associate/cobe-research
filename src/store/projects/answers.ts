import Vue from 'vue'
import firebase from '@/firebase'

const db = firebase.firestore()

interface SelectState {
  label: string;
  count: number;
}

// 回答の集計結果
interface AnswerState {
  ref: firebase.firestore.DocumentReference;
  // マトリックスの回答集計
  matrices: {(questionItem: string): {(answerOption: string): number}};
  // 回答者
  observers: Array<string>;
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference;
  // 質問参照
  questionRef: firebase.firestore.DocumentReference;
  // マトリックスのセグメント毎の回答集計
  segmentMatrices: {(questionItem: string): {(answerOption: string): number}};
  // 選択肢のセグメント毎の回答集計
  segmentSelects: Array<SelectState>;
  // スライダーのセグメント毎の回答集計
  segmentSliders: {(label: string): {(score: number): number}};
  // 選択肢の回答集計
  selects: Array<SelectState>;
  // スライダーの回答集計
  sliders: {(label: string): {(score: number): number}};
  // テキストの回答
  texts: Array<string>;
  // 質問種別
  type: string; // [text, radio, checkbox, slider, matrixRadio, matrixCheckbox]
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const state = {
	answersState: [],
}

const getters = {
	answers: (state: any) => state.answersState,
  findAnswer: (state: any) => (ref: firebase.firestore.DocumentReference) => state.answersState.find((d: AnswerState) => d.ref.id === ref.id),
}

const mutations = {
  init: (state: any) => (
    state.answersState = []
  ),
  set: (state: any, payload: AnswerState) => (
		state.answersState.push(payload)
	),
  splice: (state: any, payload: AnswerState) => {
    const i = state.answersState.findIndex((d: AnswerState) => d.ref.id === payload.ref.id)
    Vue.set(state.answersState, i, payload)
  },
  setIfNotExist: (state: any, payload: AnswerState) => {
    const i = state.answersState.findIndex((d: AnswerState) => d.ref.id === payload.ref.id)
    if (i === -1) {
      state.answersState.push(payload)
    }
  }
}

const actions = {
  _formatDoc(d1: any) {
    const d2: any = d1.data()
    if (!(d2.createdAt && d2.updatedAt)) {
      return
    }
    d2.ref = d1.ref
    // formart observers
    const observers = []
    const segmentObservers: any = {}
    for (const i in d2.observers) {
      const observer = JSON.parse(d2.observers[i])
      observers.push(observer)
      for (const j in observer.segmentIds) {
        const segmentId = observer.segmentIds[j]
        if (!segmentObservers[segmentId]) {
          segmentObservers[segmentId] = []
        }
        segmentObservers[segmentId].push(segmentId)
      }
    }
    d2.segmentObservers = segmentObservers
    d2.observers = observers
    // formart texts
    const texts = []
    for (const i in d2.texts) {
      texts.push(JSON.parse(d2.texts[i]))
    }
    d2.texts = texts
    d2.createdAt = d2.createdAt.toDate()
    d2.updatedAt = d2.updatedAt.toDate()
    return d2
  },
  async listAnswers({commit}: any, payload: AnswerState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('answers').orderBy('createdAt')
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        commit('set', actions._formatDoc(d1))
      })
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async createAnswer({commit}: any, payload: AnswerState) {
    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp()
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp()
    return await db.doc(payload.projectRef.path).collection('answers')
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
  async subscribeAnswer({commit}: any, payload: AnswerState) {
    if (!payload.projectRef) return
    return await db.doc(payload.ref.path)
    .onSnapshot(doc => {
      commit('splice', actions._formatDoc(doc))
      return true
    })
  },
  async unsubscribeAnswer({commit}: any, unsubscribe: any) {
    return await unsubscribe()
    commit()
  },
  async subscribeLastAnswer({commit}: any, payload: AnswerState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('answers')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .onSnapshot(doc => {
      if (doc.docs[0]) {
        const d: any = actions._formatDoc(doc.docs[0])
        if (d) {
          commit('setIfNotExist', d)
        }
      }
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