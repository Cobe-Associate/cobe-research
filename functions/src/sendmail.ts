import * as functions from 'firebase-functions'
const cors = require('cors')({origin: true})
const request = require('request')

export default functions
  .region('asia-northeast1')
  .https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    switch (req.method) {
      case 'POST':
        console.info(JSON.stringify(req.body.body))
        request({
          url: req.body.url,
          method: req.body.method,
          headers: req.body.headers,
          json: req.body.body
        }, (e: any, r: any, b: any) => {
          if (b) {
            console.info(b)
          }
          if (e) {
            console.error(e)
            res.status(400).send(e)
          }
          res.status(200).send()
        })
        break
      case 'OPTIONS':
        cors(req, res, () => {
          res.status(200).send()
        })
        break
      default:
        res.status(400).send(false)
        break
    }
  })
