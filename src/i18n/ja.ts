import { ja } from 'vuetify/src/locale'

export default {
  ...ja,

  moderator: {
    freeAnswer: 'フリーアンサー',
  },
  sendgrid: {
		url: 'https://api.sendgrid.com/v3/mail/send',
		from: {
      email: 'quest@cobe.work',
      name: 'Cobe Research'
		}
  }
}