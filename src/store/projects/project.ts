import Vue from 'vue'
import { DateTime } from 'luxon'
import firebase from '@/firebase'

const db = firebase.firestore()

// プロジェクト
interface ProjectState {
  id: string;
  ref: firebase.firestore.DocumentReference | null;
  // カバー画像
  coverFile: string | null;
  // 共同モデレーターのIDs
  coModeratorIds: Array<string>;
  // デモグラフィックな質問
  demographics: Array<string>; // [gender, age, residence]
  // 招待した回答者メールアドレス
  invitedObserverEmails: Array<string>;
  // プロジェクトを作成したモデレータのID (Firebase Auth の uid)
  moderatorId: string;
  // 回答者の最大参加人数
  maxOfInvitedObservers: number;
  // 全体ノート
  note: string;
  // NDAファイル
  ndaFile: string;
  // 参加した回答者
  participatedObserverRefs: Array<firebase.firestore.DocumentReference>;
  // 質問参照
  questionRefs: Array<firebase.firestore.DocumentReference>;
  // プロジェクトの状態
  status: string; // [ 'draft' （未公開）, new (公開), ready（実施中）, done (実施済),]
  // アンケート開始日
  startAt: firebase.firestore.FieldValue;
  // プロジェクト名
  title: string;
  // アンケート実施時間
  timer: number;
  // アンケート開始時間
  readyAt: firebase.firestore.FieldValue;
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
}

const initialState: ProjectState = {
  id: '',
  ref: null,
  coverFile: null,
  coModeratorIds: [],
  demographics: [],
  invitedObserverEmails: [],
  moderatorId: '',
  maxOfInvitedObservers: 0,
  note: '',
  ndaFile: '',
  participatedObserverRefs: [],
  questionRefs: [],
  readyAt: firebase.firestore.FieldValue.serverTimestamp(),
  status: '',
  startAt: firebase.firestore.FieldValue.serverTimestamp(),
  title: '',
  timer: 0,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
}

const state = {
  projectState: initialState,
  projectsState: []
}

const getters = {
  project: (state: any) => state.projectState,
  projects: (state: any) => state.projectsState,
  findProject: (state: any) => (ref: firebase.firestore.DocumentReference) => state.projectsState.find((d: ProjectState) => (d.ref || {}).id === ref.id),
  findProjectsByStatus: (state: any) => (status: Array<string>) => state.projectsState.filter((d: ProjectState) => status.includes(d.status))
}

const mutations = {
  init: (state: any) => (
    state.projectState = initialState
  ),
  set: (state: any, payload: ProjectState) => (
    state.projectState = payload
  ),
  update: (state: any, payload: ProjectState) => {
    let key: keyof ProjectState
    for (key in payload) {
      state.projectState[key] = payload[key]
    }
  },
  initList: (state: any) => (
    state.projectsState = []
  ),
  setList: (state: any, payload: Array<ProjectState>) => (
    state.projectsState.push(payload)
  ),
  removeList:(state: any, payload: ProjectState) => {
    const i: number = state.projectsState.findIndex((v: ProjectState) => v.ref === payload.ref)
    Vue.delete(state.projectsState, i)
  }
}

const actions = {
  async listProjects({commit}: any, payload: ProjectState) {
    if (!payload.moderatorId) return
    return await db.collection('projects').where('moderatorId', '==', payload.moderatorId)
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        const d2: any = d1.data()
        d2.id = d1.id
        d2.ref = d1.ref
        if (d2.startAt) {
           d2.startAt = d2.startAt.toDate()
           d2.startJST = DateTime.fromJSDate(d2.startAt).toFormat('yyyy.MM.dd HH:mm')
        }
        if (d2.readyAt) {
          d2.readyAt = d2.readyAt.toDate()
        }
        d2.createdAt = d2.createdAt.toDate()
        d2.updatedAt = d2.updatedAt.toDate()
        commit('setList', d2)
      })
      return true
    })
    .catch(() => {
      commit('initList')
      return false
    })
  },
  async listProjectsByCoModerators({commit}: any, payload: ProjectState) {
    if (!payload.moderatorId) return
    await db.collection('projects').where('moderatorId', '==', payload.moderatorId)
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        const d2: any = d1.data()
        d2.id = d1.id
        d2.ref = d1.ref
        if (d2.startAt) {
           d2.startAt = d2.startAt.toDate()
           d2.startJST = DateTime.fromJSDate(d2.startAt).toFormat('yyyy.MM.dd HH:mm')
        }
        if (d2.readyAt) {
          d2.readyAt = d2.readyAt.toDate()
        }
        d2.createdAt = d2.createdAt.toDate()
        d2.updatedAt = d2.updatedAt.toDate()
        commit('setList', d2)
      })
    })
    return await db.collection('projects').where('coModeratorIds', 'array-contains', payload.moderatorId)
    .get()
    .then(doc => {
      doc.docs.forEach(d1 => {
        const d2: any = d1.data()
        d2.id = d1.id
        d2.ref = d1.ref
        if (d2.startAt) {
           d2.startAt = d2.startAt.toDate()
           d2.startJST = DateTime.fromJSDate(d2.startAt).toFormat('yyyy.MM.dd HH:mm')
        }
        if (d2.readyAt) {
          d2.readyAt = d2.readyAt.toDate()
        }
        d2.createdAt = d2.createdAt.toDate()
        d2.updatedAt = d2.updatedAt.toDate()
        commit('setList', d2)
      })
      return true
    })
    .catch(() => {
      commit('initList')
      return false
    })
  },
  async getProject({commit}: any, payload: ProjectState) {
    if (!payload.id) return
    return await db.doc('projects/' + payload.id)
    .get()
    .then(doc => {
      if (doc.exists) {
        const data = Object.assign({
          ref: doc.ref
        }, doc.data())
        if (data.startAt) {
           data.startAt = data.startAt.toDate()
           data.startJST = DateTime.fromJSDate(data.startAt).toFormat('yyyy.MM.dd HH:mm')
        }
        if (data.readyAt) {
          data.readyAt = data.readyAt.toDate()
        }
        data.createdAt = data.createdAt.toDate()
        data.updatedAt = data.updatedAt.toDate()
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
  async createProject({commit}: any, payload: ProjectState) {
    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp()
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp()
    return await db.collection('projects')
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
  async updateProject({commit}: any, payload: ProjectState) {
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
  async deleteProject({commit}: any, payload: ProjectState) {
    if (!payload.ref) return
    return await db.doc(payload.ref.path)
    .delete()
    .then(() => {
      commit('removeList', payload)
      return true
    })
    .catch(() => {
      commit('init')
      return false
    })
  },
  async subscribeProject({commit}: any, payload: ProjectState) {
    if (!payload.ref) return
    return await db.doc(payload.ref.path)
    .onSnapshot(doc => {
      const data = Object.assign({
        ref: doc.ref
      }, doc.data())
      if (data.createdAt && data.updatedAt) {
        if (data.startAt) {
           data.startAt = data.startAt.toDate()
           data.startJST = DateTime.fromJSDate(data.startAt).toFormat('yyyy.MM.dd HH:mm')
        }
        if (data.readyAt) {
          data.readyAt = data.readyAt.toDate()
        }
        data.createdAt = data.createdAt.toDate()
        data.updatedAt = data.updatedAt.toDate()
        commit('set', data)
      }
      return true
    })
  },
  async unsubscribeProject({commit}: any, unsubscribe: any) {
    return await unsubscribe()
    commit()
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}