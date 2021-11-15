# cobe-research

An online research tool that reduces the time spent on new business user surveys to less than 1/10.

[![Figma](https://user-images.githubusercontent.com/3213880/141861013-ad84e7ec-49fe-4225-8948-cb0444c9d2a7.png)](https://www.figma.com/proto/ORiHLKBQmHzEML2IkwptY5/200602_CobeResearch?node-id=122%3A0&scaling=scale-down&page-id=119%3A55&starting-point-node-id=122%3A0)

## System design

### Technology stack and architecture

* Cloud Service
  * Firebase on Google Cloud Platform (GCP)
* Authentication
  * Firebase Authentication
* Database
  * Firebase Firestone for realtime
  * Firebase Storage to store image and video files
  * Google Storage to back up Firestone
* Hosting
  * Firebase Hosting
* Backend
  * Firebase Function
  * Firebase Extensions to resize image
  * SendGrid for email delivery
  * Algolia for site search and discovery
  * A
* Frontend
  * TypeScript + Vue.js
* UI F/W
  * Vuetify. Google Material Design

![architecture](https://user-images.githubusercontent.com/3213880/141861668-5a437c1c-5a5c-4fa9-a4ae-58d1896bd4df.png)

### DB

See https://github.com/Cobe-Associate/cobe-research/tree/main/src/store.

### Backup

Back up only Firestone in production environment. See https://github.com/Cobe-Associate/cobe-research/blob/main/functions/src/firestone-backup.ts.

## Project setup

### Register Firebase and external　services.

* Register firebase and get config.

* Register email delivery service [SendGrid](https://sendgrid.kke.co.jp) and get API key. Note! Set up https://github.com/Cobe-Associate/cobe-research-ext to post SendGrid API from web browser avoiding CORS.

* Register site search and discovery service [Algolia](https://www.algolia.com) and get app id and API key.

### Setup .env files.

Setup `.env.development`, `.env.staging`, and `.env.production`. 

```
NODE_ENV=production
VUE_APP_ENV=production

VUE_APP_ADMIN_EMAIL=["sample@cobe.work"]

VUE_APP_ALGOLIA_APP_ID=xxxxxx
VUE_APP_ALGOLIA_API_KEY=xxxxxx

VUE_APP_FIREBASE_CONFIG={"apiKey": "xxxxxx", "authDomain": "xxxxxx", "databaseURL": "xxxxxx", "projectId": "xxxxxx", "storageBucket": "xxxxxx", "messagingSenderId": "xxxxxx", "appId": "xxxxxx", "measurementId": "xxxxxx"}

VUE_APP_FUNCTION_URL=xxxxxx

VUE_APP_FB_EXT_SIZES_OF_RESIZED_IMAGES=200x200

VUE_APP_OBSERVER_EMAIL=sample@cobe.work
VUE_APP_OBSERVER_PW=123456

VUE_APP_SENDGRID_KEY=xxxxxx
```

### Install libs.

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

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Copyright (c) 2021, Cobe Associe Llc. All Right Reserved.
