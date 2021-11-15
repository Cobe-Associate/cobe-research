import * as functions from 'firebase-functions'
import * as firestore from '@google-cloud/firestore'

const client = new firestore.v1.FirestoreAdminClient()

const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
// Google Cloud Storage に {プロジェクトID}-backup-firestone という名前のバケットを予め作成すること
const bucket = 'gs://' + projectId + '-backup-firestone'

export default functions
  .region('asia-northeast1')
  .pubsub
  .schedule('0 1 * * 1')
  .timeZone('Asia/Tokyo')
  .onRun(async (context: any) => {
    // 本番環境のみバックアップファイルを保存
    if (projectId !== 'cobe-research-prod') {
      return
    }
    const databaseName = client.databasePath(projectId, '(default)')
    return await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      collectionIds: []
    })
    .then((responses: any) => {
      const response = responses[0]
      console.log(`Operation Name: ${response['name']}`)
      return response
    })
    .catch((err: any) => {
      console.error(err)
      throw new Error(err)
    })
  })