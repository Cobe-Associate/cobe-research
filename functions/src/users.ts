import * as functions from 'firebase-functions'
const cors = require('cors')({origin: true})
import admin from './admin'

export default functions
	.region('asia-northeast1')
	.https.onRequest((request, response) => {
		response.set('Access-Control-Allow-Origin', '*')
		switch (request.method) {
			case 'GET':
			  // ToDo: 1000件以上を取得する場合、nextPageToken を指定
			  // https://firebase.google.com/docs/auth/admin/manage-users?hl=ja
				admin.auth().listUsers(1000)
				.then(data => {
					response.send({
						users: data.users,
						pageToken: data.pageToken
					})
				})
				.catch(error => {
					response.status(400).send(false)
				})
				break
			case 'POST':
				admin.auth().createUser({
					email: request.body.email,
					password: request.body.password,
					displayName: request.body.displayName,
				})
				.then(user => {
					response.send(user)
				})
				.catch(error => {
					response.status(400).send(error)
				})
				break
			case 'PUT':
				admin.auth().updateUser(request.body.uid, {
					email: request.body.email,
					displayName: request.body.displayName,
				})
				.then(user => {
					response.send(user)
				})
				.catch(error => {
					response.status(400).send(error)
				})
				break
			case 'DELETE':
				admin.auth().deleteUser(request.body.uid)
				.then(() => {
					response.send({})
				})
				.catch(error => {
					response.status(400).send(error)
				})
				break
			case 'OPTIONS':
				cors(request, response, () => {
					response.status(200).send()
				})
				break
			default:
				response.status(400).send(false)
				break
		}
	})
