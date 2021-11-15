import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import firebase from '../firebase'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [{
    path: '/moderator/login',
    component: () => import('../views/moderator/Login.vue')
  }, {
    path: '/moderator',
    component: () => import('../views/moderator/Home.vue'),
    meta: {
      requiresAuth: true
    }
  }, {
    path: '/moderator/new-project',
    component: () => import('../views/moderator/NewProject.vue'),
    meta: {
      requiresAuth: true
    }
  }, {
    path: '/moderator/questionnaire',
    component: () => import('../views/moderator/Questionnaire.vue'),
    meta: {
      requiresAuth: true
    }
  }, {
    path: '/moderator/questionnaire/export-data',
    component: () => import('../views/moderator/QuestionnaireExportData.vue'),
    meta: {
      requiresAuth: true
    }
  }, {
    path: '/observer/entry',
    component: () => import('../views/observer/Entry.vue'),
    meta: {
      requiresObserver: true
    }
  }, {
    path: '/observer/questionnaire',
    component: () => import('../views/observer/Questionnaire.vue'),
    meta: {
      requiresObserver: true
    }
  }, {
    path: '/admin',
    component: () => import('../views/admin/Home.vue'),
    meta: {
      requiresAdmin: true
    }
  }, {
    path: '*',
    component: () => import('../views/NotFound.vue'),
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(recode => recode.meta.requiresAuth)) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        next({
          path: '/moderator/login',
          query: {
            redirect: to.fullPath
          }
        })
      } else {
        next()
      }
    })
    // モデレーターのみ Analytics を有効
    firebase.analytics()
  } else if (to.matched.some(recode => recode.meta.requiresObserver)) {
    // 特殊な設計：Firebase の読み書きをするために仮ログイン
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        firebase.auth().signInWithEmailAndPassword(process.env.VUE_APP_OBSERVER_EMAIL, process.env.VUE_APP_OBSERVER_PW)
        .then(() => {
          next()
        })
      } else {
        next()
      }
    })
  } else if (to.matched.some(recode => recode.meta.requiresAdmin)) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user || !JSON.parse(process.env.VUE_APP_ADMIN_EMAIL).includes(user.email)) {
        next({
          path: '/moderator/login'
        })
      } else {
        next()
      }
    })
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  if (from.path !== '/' && to.path === '/moderator' && from.path !== to.path) {
    location.reload()
  }
})

export default router
