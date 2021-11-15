import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

// Your own translation file
import ja from '../i18n/ja'

export default new Vuetify({
  lang: {
    locales: { ja },
    current: 'ja',
  },
})
