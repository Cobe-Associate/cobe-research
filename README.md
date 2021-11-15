# cobe-research

## Project setup
```sh
yarn install
```

### Compiles and hot-reloads for development
```sh
yarn serve
```

## Deploy

### Prepare firebase extensions

* Install [Resize Images](https://firebase.google.com/products/extensions/storage-resize-images) and set *sizes of resized images* in *.env* file.

### Get token to delete SubCollection in firestone by Firebase CLI
```sh
firebase login:ci

firebase functions:config:set fb.token="{ copy token }"
```

### Set CORS To Download File From Firebase Storage

See detail in [Download Files on Web](https://firebase.google.com/docs/storage/web/download-files).

```sh
gsutil cors set storage-cors.json gs://cobe-research-prod.appspot.com

gsutil cors get gs://cobe-research-prod.appspot.com
```

### Compiles and minifies for production, development and staging
```sh
yarn build

yarn build:development

yarn build:staging
```

### Deploys for Firebase Hosting
```sh
firebase use cobe-research-prod

firebase deploy
```

### Deploys Firebase Functions

See */functions/package.json*

### Lints and fixes files
```sh
yarn lint
```