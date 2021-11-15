import firebase from '@/firebase'

const storage = firebase.storage()

// Firebase Storage 守秘義務書類
interface NdaFileState {
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
  async getNdaFile({commit}: any, payload: NdaFileState) {
    if (!payload.name) return
    const name = (payload.name.match(/([^/]*)\./) || [])[1]
    const ext = 'pdf'
    return await storage.ref().child('ndafile/' + name + '.' + ext)
    .getDownloadURL()
    .then(url => {
      return url
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async createNdaFile({commit}: any, payload: NdaFileState) {
    if (!payload.file || !payload.name) return
    const ext = 'pdf'
    try {
      await storage.ref().child('ndafile/' + payload.name + '.' + ext)
      .delete()
    } catch {
      //
    }
    return await storage.ref().child('ndafile/' + payload.name + '.' + ext)
    .put(payload.file)
    .then(snapshot => {
      return snapshot.ref.name
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async deleteNdaFile({commit}: any, payload: NdaFileState) {
    if (!payload.name) return
    const ext = 'pdf'
    try {
      return await storage.ref().child('ndafile/' + payload.name + '.' + ext)
      .delete()
    } catch {
      return null
    }
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