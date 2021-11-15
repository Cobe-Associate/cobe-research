import firebase from '@/firebase'
import { getFileMeta } from '@/utils/file-meta'

const storage = firebase.storage()

// Firebase Storage 質問ファイル
interface QuestionFileState {
  // ファイル
  file: File;
  // ファイル名
  name: string;
}

const state = {
}

const getters = {
}

const mutations = {
}

const actions = {
  async getQuestionFile({commit}: any, payload: QuestionFileState) {
    if (!payload.name) return
    const name = (payload.name.match(/([^/]*)\./) || [])[1]
    const ext = (payload.name.match(/[^.]+$/) || [])[0]
    const fileMeta = getFileMeta(payload.name)
    return await storage.ref().child('questions/' + name + (fileMeta && fileMeta.type === 'image' ? '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES : '') + '.' + ext)
    .getDownloadURL()
    .then(url => {
      return url
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async createQuestionFile({commit}: any, payload: QuestionFileState) {
    if (!payload.file) return
    if (!payload.name) {
      payload.name = new Date().getTime().toString(16)
    } else {
      payload.name = (payload.name.match(/([^/]*)\./) || [])[1]
    }
    const ext = payload.file.name.slice((payload.file.name.lastIndexOf('.') - 1 >>> 0) + 2)
    try {
      const fileMeta = getFileMeta(payload.name)
      await storage.ref().child('questions/' + payload.name + (fileMeta && fileMeta.type === 'image' ? '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES : '') + '.' + ext)
      .delete()
    } catch {
      //
    }
    return await storage.ref().child('questions/' + payload.name + '.' + ext)
    .put(payload.file)
    .then(snapshot => {
      return snapshot.ref.name
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async deleteQuestionFile({commit}: any, payload: QuestionFileState) {
    if (!payload.name) return
    const name = (payload.name.match(/([^/]*)\./) || [])[1]
    const ext = (payload.name.match(/[^.]+$/) || [])[0]
    const fileMeta = getFileMeta(payload.name)
    return await storage.ref().child('questions/' + name + (fileMeta && fileMeta.type === 'image' ? '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES : '') + '.' + ext)
    .delete()
    .then(() => {
      return true
    })
    .catch(() => {
      return false
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