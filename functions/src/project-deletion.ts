import * as functions from 'firebase-functions'
const firebase_tools = require('firebase-tools')
import admin from './admin'

const db = admin.firestore()

export default functions
  .region('asia-northeast1')
  .firestore
  .document('projects/{id}')
  .onDelete((snap, context) => {
    try {
      firebase_tools.firestore
      .delete(snap.ref.path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
      })
    } catch (e) {
      console.error(e)
    }

    db.collection('observers').where('projectRef', '==', snap.ref)
    .get()
    .then(docs => {
      docs.forEach(doc => {
        doc.ref.delete()
        .then(() => {
          //
        }).catch(e => {
          console.error(e)
        })
      })
    })
    .catch(e => {
      console.error(e)
    })

    db.collection('observerAnswers').where('projectRef', '==', snap.ref)
    .get()
    .then(docs => {
      docs.forEach(doc => {
        doc.ref.delete()
        .then(() => {
          //
        }).catch(e => {
          console.error(e)
        })
      })
    })
    .catch(e => {
      console.error(e)
    })
    return true
  })