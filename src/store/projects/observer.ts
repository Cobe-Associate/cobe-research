import firebase from '@/firebase'

const db = firebase.firestore()

// 回答者
interface ObserverState {
  id: string;
  ref: firebase.firestore.DocumentReference | null;
  // 年齢
  age: number | null;
  // Eメール
  email: string;
  // 性別
  gender: number | null; // 1, 2, 9
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference | null;
  // 調査参照
  researchRef: firebase.firestore.DocumentReference | null;
  // 居住地
  residence: string | null;
  // 状態
  status: string; // ['', done]
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const initialState: ObserverState = {
  id: '',
  ref: null,
  age: null,
  email: '',
  gender: null,
  projectRef: null,
  researchRef: null,
  residence: null,
  status: '',
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
}

const state = {
	observerState: initialState,
  observersState: []
}

const getters = {
  observer: (state: any) => state.observerState
}

const mutations = {
	init: (state: any) => (
    state.observerState = initialState
  ),
	set: (state: any, payload: ObserverState) => (
		state.observerState = payload
	),
  update: (state: any, payload: ObserverState) => {
    let key: keyof ObserverState
    for (key in payload) {
      state.observerState[key] = payload[key]
    }
  }
}

const actions = {
  async getObserver({commit}: any, payload: ObserverState) {
    if (!payload.id) return
    return await db.doc('observers/' + payload.id)
    .get()
    .then(doc => {
      if (doc.exists) {
        const data = Object.assign({
          ref: doc.ref
        }, doc.data())
        commit('set', data)
        return data
      } else {
        commit('init')
        return null
      }
    })
    .catch(() => {
      commit('init')
      return null
    })
  },
  async createObserver({commit}: any, payload: ObserverState) {
    if (!payload.projectRef) return
    return await db.collection('observers')
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
  async updateObserver({commit}: any, payload: ObserverState) {
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
  async findObserver({commit}: any, payload: ObserverState) {
    if (!payload.projectRef || !payload.email) return
    return await db.collection('observers').where('projectRef', '==', payload.projectRef).where('email', '==', payload.email)
    .get()
    .then(doc => {
      if (doc.docs.length === 0) {
        return null
      }
      const d1 = doc.docs[0]
      const d2: any = d1.data()
      d2.id = d1.id
      d2.ref = d1.ref
      d2.createdAt = d2.createdAt.toDate()
      d2.updatedAt = d2.updatedAt.toDate()
      commit('set', d2)
      return d2
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async findObservers({commit}: any, payload: ObserverState) {
    if (!payload.projectRef) return
    return await db.collection('observers').where('projectRef', '==', payload.projectRef)
    .get()
    .then(doc => {
      if (doc.docs.length === 0) {
        return []
      }
      const data = []
      for (const i in doc.docs) {
        const d1 = doc.docs[i]
        const d2: any = d1.data()
        d2.id = d1.id
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