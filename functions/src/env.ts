const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
const env: any = {}

env.projectId = projectId
env.sendgrid = {
  url: 'https://api.sendgrid.com/v3/mail/send',
  from: {
    email: 'quest@cobe.work',
    name: 'Cobe Research'
  },
  key: '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'
}

export default env