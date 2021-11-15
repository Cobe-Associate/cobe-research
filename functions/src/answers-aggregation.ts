import * as functions from 'firebase-functions'
import admin from './admin'

const db = admin.firestore()

export default functions
  .region('asia-northeast1')
  .firestore
  .document('observerAnswers/{id}')
  .onCreate((snap, context) => {
  	const data = snap.data()
    const segmentIds: string[] = []
    data.segmentRefs.forEach((segmentRef: any) => {
      segmentIds.push(segmentRef.id)
    })
    const obj: any = {
      'observers': admin.firestore.FieldValue.arrayUnion(JSON.stringify({
        observerId: context.params.id,
        segmentIds: segmentIds
      }))
    }
    if (data.text) {
      obj['texts'] = admin.firestore.FieldValue.arrayUnion(JSON.stringify({
        observerId: context.params.id,
        text: data.text,
        segmentIds: segmentIds
      }))
    }
    if (data.type === 'radio' || data.type === 'checkbox') {
      for (const i in data.selects) {
        obj['selects.' + data.selects[i]] = admin.firestore.FieldValue.increment(1)
        for (const j in data.segmentRefs) {
          obj['segmentSelects.' + data.segmentRefs[j].id + '.' + data.selects[i]] = admin.firestore.FieldValue.increment(1)
        }
      }
    } else if (data.type === 'slider') {
      if (data.sliderLabel && data.sliderScore) {
        obj['sliders.' + data.sliderLabel + '.' + data.sliderScore] = admin.firestore.FieldValue.increment(1)
        for (const j in data.segmentRefs) {
          obj['segmentSliders.' + data.segmentRefs[j].id + '.' + data.sliderLabel + '.' + data.sliderScore] = admin.firestore.FieldValue.increment(1)
        }
      }
    } else if (data.type === 'matrixRadio' || data.type === 'matrixCheckbox') {
      for (const questionItem in data.matrices) {
        for (const i in data.matrices[questionItem]) {
          obj['matrices.' + questionItem + '.' + data.matrices[questionItem][i]] = admin.firestore.FieldValue.increment(1)
          for (const j in data.segmentRefs) {
            obj['segmentMatrices.' + data.segmentRefs[j].id + '.' + questionItem + '.' + data.matrices[questionItem][i]] = admin.firestore.FieldValue.increment(1)
          }
        }
      }
    }
    db.doc(data.answerRef.path)
    .update(obj)
    .catch((e) => {
      console.error(context.params.id  + ' error: ' + e)
    })
    return true
  })