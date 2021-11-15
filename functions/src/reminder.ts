import * as functions from 'firebase-functions'
const axios = require('axios')
import admin from './admin'
import env from './env'

const db = admin.firestore()

export default functions
  .region('asia-northeast1')
  .pubsub
  .schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context: any) => {
    db.collection('reminds')
    .get()
    .then(doc => {
      doc.docs.forEach(d => {
        const remind = d.data()
        const diffMin = Math.floor((remind.sendAt.toDate().getTime() - new Date().getTime()) / (1000 * 60))
        if (diffMin <= 10) {
          // モデレータにリマンド
          let personalizations: Array<any> = []
          remind.moderatorEmails.forEach((email: string) => {
            personalizations.push({
              'to': [{
                'email': email
              }],
              'dynamic_template_data': {
                'projectTitle': remind.title,
                'projectStartAt': remind.startAt,
                'projectScheduledTime': remind.scheduledTime + '分',
                'projectModeratorUrl': 'https://cobequest.net/moderator'
              }
            })
          })
          let param = {
            url: env.sendgrid.url,
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + env.sendgrid.key,
              'Content-Type': 'application/json; charset=utf-8'
            },
            body: {
              'personalizations': personalizations,
              'from': {
                'email': env.sendgrid.from.email,
                'name': env.sendgrid.from.name,
              },
              'template_id': 'd-571ec3e4c6c74c2cb7d562756e29f8aa'
            }
          }
          axios
          .post('https://asia-northeast1-' + env.projectId + '.cloudfunctions.net' + '/sendmail', param)
          // 回答者にリマインド
          personalizations = []
          remind.observerEmails.forEach((email: string) => {
            personalizations.push({
              'to': [{
                'email': email
              }],
              'dynamic_template_data': {
                'projectTitle': remind.title,
                'projectStartAt': remind.startAt,
                'projectScheduledTime': remind.scheduledTime + '分',
                'projectInvitationUrl': remind.invitationUrl + '&email=' + email
              }
            })
          })
          param = {
            url: env.sendgrid.url,
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + env.sendgrid.key,
              'Content-Type': 'application/json; charset=utf-8'
            },
            body: {
              'personalizations': personalizations,
              'from': {
                'email': env.sendgrid.from.email,
                'name': env.sendgrid.from.name,
              },
              'template_id': 'd-d2fd8aa445374dbaa32ff1698918884d'
            }
          }
          axios
          .post('https://cobe-research-ext.herokuapp.com/api/sendmail', param)
          // remind を削除
          db.doc(d.ref.path)
          .get()
          .then(dd => {
            dd.ref.delete()
            .then(() => {
              //
            }).catch(e => {
              console.error(e)
            })
          })
          .catch(e => {
            console.error(e)
          })
        }
      })
    })
    .catch(e => {
      console.error(e)
    })
    return true
  })
