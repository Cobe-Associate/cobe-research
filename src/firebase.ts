import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/analytics'
import 'firebase/firestore'
import 'firebase/storage'

firebase.initializeApp(JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG))

export default firebase