import Vue from 'vue'
import Rollbar from 'rollbar'

if (location.hostname !== 'localhost') {
  const rollbar = new Rollbar({
    accessToken: '6bcb795b2a094e4fa0377584ca055f1c',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: process.env.NODE_ENV
    }
  })
  Vue.prototype.$rollbar = rollbar
  Vue.config.errorHandler = (err, vm, info) => {
    rollbar.error(err, { info })
  }
}