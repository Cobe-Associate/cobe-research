import Vue from 'vue'
import firebase from '@/firebase'

const db = firebase.firestore()

// 質問
interface QuestionState extends ProjectState {
  ref: firebase.firestore.DocumentReference;
  // 選択肢
  answerOptions: Array<string>;
  // スライダーのラベル
  answerSliderLabel: Array<string>; // (0: 左側のラベル, 1: 右側のラベル)
  // 質問タイプ
  answerType: string | null; // [text, radio, checkbox, slider, matrixRadio, matrixCheckbox]
  // 内容
  body: string;
  // ファイル
  files: Array<string>;
  // フリーアンサーを含むか
  isFreeAnswer: boolean;
  // ノート
  note: string | null;
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference;
  // 設問項目
  questionItems: Array<string>;
  // 送信日時
  sentAt: firebase.firestore.FieldValue;
  // ブロック名
  subject: string;
  // 配分時間
  time: number;
  // 質問タイプ
  type: string; // [normal: 通常, question: 質問]
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

interface ProjectState {
  questionRefs: Array<firebase.firestore.DocumentReference>;
}

const state = {
  questionsState: [],
}

const getters = {
  questions: (state: any) => state.questionsState,
  findQuestion: (state: any) => (ref: firebase.firestore.DocumentReference) => state.questionsState.find((d: QuestionState) => d.ref.id === ref.id),
  findQuestionById: (state: any) => (id: string) => state.questionsState.find((d: QuestionState) => d.ref.id === id),
}

const mutations = {
  init: (state: any) => (
    state.questionsState = []
  ),
  set: (state: any, payload: QuestionState) => (
    state.questionsState.push(payload)
  ),
  setIfNotExist: (state: any, payload: QuestionState) => {
    const i = state.questionsState.findIndex((d: QuestionState) => d.ref.id === payload.ref.id)
    if (i === -1) {
      state.questionsState.push(payload)
    } else {
      const question: any = state.questionsState[i]
      let key: keyof QuestionState
      for (key in payload) {
        question[key] = payload[key]
      }
      Vue.set(state.questionsState, i, question)
    }
  },
  update: (state: any, payload: QuestionState) => {
    const i: number = state.questionsState.findIndex((v: QuestionState) => v.ref === payload.ref)
    const question: any = state.questionsState[i]
    let key: keyof QuestionState
    for (key in payload) {
      question[key] = payload[key]
    }
    Vue.set(state.questionsState, i, question)
  },
  delete:(state: any, payload: QuestionState) => {
    const i: number = state.questionsState.findIndex((v: QuestionState) => v.ref === payload.ref)
    Vue.delete(state.questionsState, i)
  }
}

const actions = {
  async listQuestions({commit}: any, payload: QuestionState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('questions')
    .get()
    .then(doc => {
      payload.questionRefs.forEach(questionRef => {
        const d1: any = doc.docs.find(d => d.ref.id === questionRef.id) || {}
        const d2: any = d1.data()
        d2.ref = d1.ref
        if (d2.sentAt) {
          d2.sentAt = d2.sentAt.toDate()
        }
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
  async createQuestion({commit}: any, payload: QuestionState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('questions')
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
  async updateQuestion({commit}: any, payload: QuestionState) {
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
  async deleteQuestion({commit}: any, payload: QuestionState) {
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
  changeOrder({commit}: any, payload: Array<QuestionState>) {
    commit('init')
    payload.forEach(d => {
      commit('set', d)
    })
  },
  async subscribeLastQuestion({commit}: any, payload: QuestionState) {
    if (!payload.projectRef) return
    return await db.doc(payload.projectRef.path).collection('questions')
    .orderBy('updatedAt', 'desc')
    .limit(1)
    .onSnapshot(doc => {
      if (doc.docs[0]) {
        const d: any = doc.docs[0].data()
        if (d.createdAt && d.updatedAt) {
          d.ref = doc.docs[0].ref
          if (d.sentAt) {
            d.sentAt = d.sentAt.toDate()
          }
          d.createdAt = d.createdAt.toDate()
          d.updatedAt = d.updatedAt.toDate()
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