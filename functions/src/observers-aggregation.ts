import * as functions from 'firebase-functions'
import admin from './admin'

const db = admin.firestore()

export default functions
  .region('asia-northeast1')
  .firestore
  .document('observers/{id}')
  .onCreate((snap, context) => {
  	const data = snap.data()
    db.doc(data.projectRef.path)
    .update({
    	participatedObserverRefs: admin.firestore.FieldValue.arrayUnion(snap.ref)
    })
    .catch((e) => {
      console.error(context.params.id  + ' error: ' + e)
    })
    return true
  })