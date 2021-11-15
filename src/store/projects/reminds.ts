import firebase from '@/firebase'

const db = firebase.firestore()

// リマインド
interface RemindState {
  // 回答者招待URL
  invitationUrl: string;
  // モデレータメールアドレス
  moderatorEmails: Array<string>;
  // プロジェクト参照
  projectRef: firebase.firestore.DocumentReference | null;
  // プロジェクト名
  title: string;
  // 回答者メールアドレス
  observerEmails: Array<string>;
  // 開始日時
  startAt: string;
  // 予定時間
  scheduledTime: string;
  // 送信時間
  sendAt: firebase.firestore.FieldValue;
}

const initialState: RemindState = {
  invitationUrl: '',
  moderatorEmails: [],
  projectRef: null,
  title: '',
  observerEmails: [],
  startAt: '',
  scheduledTime: '',
  sendAt: firebase.firestore.FieldValue.serverTimestamp(),
}

const state = {
  remindState: initialState,
}

const getters = {
  remind: (state: any) => state.remindState
}

const mutations = {
  init: (state: any) => (
    state.remindState = initialState
  ),
  set: (state: any, payload: RemindState) => (
    state.remindState = payload
  ),
}

const actions = {
  async createRemind({commit}: any, payload: RemindState) {
    if (!payload.projectRef) return
    return await db.collection('reminds').doc(payload.projectRef.id)
    .set(payload)
    .then(() => {
      commit('set', payload)
      return payload
    })
    .catch(() => {
      commit('init')
      return null
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