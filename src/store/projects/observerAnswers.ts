import firebase from '@/firebase'

const db = firebase.firestore()

// 回答
interface ObserverAnswerState {
  ref: firebase.firestore.DocumentReference;
  // マトリックスの回答
  matrices: {(questionItem: string): Array<string>};
  // 回答集計の参照
  answerRef: firebase.firestore.DocumentReference;
  // 回答者参照
  observerRef: firebase.firestore.DocumentReference;
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference | null;
  // セグメント参照
  segmentRefs: Array<firebase.firestore.DocumentReference>;
  // 選択肢の回答
  selects: Array<string>;
  // スライダーの回答ラベル
  sliderLabel: string | null;
  // スライダーの回答スコア
  sliderScore: number | null; // [0..9]
  // テキストの回答
  text: string;
  // 質問種別
  type: string; // [text, radio, checkbox, slider, matrixRadio, matrixCheckbox]
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const state = {
	observerAnswersState: []
}

const getters = {
  observerAnswers: (state: any) => state.observerAnswersState,
}

const mutations = {
	init: (state: any) => (
    state.observerAnswersState = []
  ),
	set: (state: any, payload: ObserverAnswerState) => (
		state.observerAnswersState.push(payload)
	),
}

const actions = {
  async listObserverAnswers({commit}: any, payload: ObserverAnswerState) {
    if (!payload.observerRef) return
    return await db.collection('observerAnswers').where('observerRef', '==', payload.observerRef)
    .get()
    .then(doc => {
      doc.docs.forEach(doc => {
        const d: any = doc.data()
        d.ref = doc.ref
        d.createdAt = d.createdAt.toDate()
        d.updatedAt = d.updatedAt.toDate()
        commit('set', d)
      })
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async createObserverAnswer({commit}: any, payload: ObserverAnswerState) {
    if (!payload.answerRef || !payload.observerRef) return
    return await db.collection('observerAnswers')
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
  async findObserverAnswers({commit}: any, payload: ObserverAnswerState) {
    if (!payload.projectRef) return
    return await db.collection('observerAnswers').where('projectRef', '==', payload.projectRef)
    .orderBy('createdAt', 'asc')
    .get()
    .then(doc => {
      if (doc.docs.length === 0) {
        return []
      }
      const data = []
      for (const i in doc.docs) {
        const d1 = doc.docs[i]
        const d2: any = d1.data()
        d2.ref = d1.ref
        d2.createdAt = d2.createdAt.toDate()
        d2.updatedAt = d2.updatedAt.toDate()
        data.push(d2)
      }
      return data
    })
    commit()
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}