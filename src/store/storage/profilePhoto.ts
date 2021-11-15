import firebase from '@/firebase'

const storage = firebase.storage()

// Firebase Storage プロファイル写真
interface ProfilePhotoState {
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
  async getProfilePhoto({commit}: any, payload: ProfilePhotoState) {
    if (!payload.name) return
    const name = (payload.name.indexOf('.') !== -1) ? (payload.name.match(/([^/]*)\./) || [])[1] : payload.name
    const ext = 'jpeg'
    return await storage.ref().child('profilephotos/' + name + '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES + '.' + ext)
    .getDownloadURL()
    .then(url => {
      return url
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async createProfilePhoto({commit}: any, payload: ProfilePhotoState) {
    if (!payload.file || !payload.name) return
    const ext = 'jpeg'
    try {
      await storage.ref().child('profilephotos/' + payload.name + '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES + '.' + ext)
      .delete()
    } catch {
      //
    }
    return await storage.ref().child('profilephotos/' + payload.name + '.' + ext)
    .put(payload.file)
    .then(snapshot => {
      return snapshot.ref.name
    })
    .catch(() => {
      return null
    })
    commit()
  },
  async deleteProfilePhoto({commit}: any, payload: ProfilePhotoState) {
    if (!payload.name) return
    const ext = 'jpeg'
    try {
      return await storage.ref().child('profilephotos/' + payload.name + '_' + process.env.VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES + '.' + ext)
      .delete()
    } catch {
      return null
    }
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