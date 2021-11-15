import algoliasearch from 'algoliasearch'

const client = algoliasearch(process.env.VUE_APP_ALGOLIA_APP_ID, process.env.VUE_APP_ALGOLIA_API_KEY)
const index = client.initIndex(process.env.NODE_ENV + '_MODERATORS')

export default index