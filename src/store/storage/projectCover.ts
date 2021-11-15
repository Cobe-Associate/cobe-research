import firebase from '@/firebase'

const storage = firebase.storage()

// Firebase Storage プロジェクトカバー画像
interface ProjectCoverState {
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
  async getProjectCover({commit}: any, payload: ProjectCoverState) {
    if (!payload.name) return
    const name = (payload.name.match(/([^/]*)\./) || [])[1]
    const ext = 'jpeg'
    return await storage.ref().child('projectcovers/' + name + '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES + '.' + ext)
    .getDownloadURL()
    .then(url => {
      return url
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async createProjectCover({commit}: any, payload: ProjectCoverState) {
    if (!payload.file || !payload.name) return
    const ext = 'jpeg'
    try {
      await storage.ref().child('projectcovers/' + payload.name + '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES + '.' + ext)
      .delete()
    } catch {
      //
    }
    return await storage.ref().child('projectcovers/' + payload.name + '.' + ext)
    .put(payload.file)
    .then(snapshot => {
      return snapshot.ref.name
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async deleteProjectCover({commit}: any, payload: ProjectCoverState) {
    if (!payload.name) return
    const ext = 'jpeg'
    try {
      return await storage.ref().child('projectcovers/' + payload.name + '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES + '.' + ext)
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