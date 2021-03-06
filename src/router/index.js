import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Settings from '@/components/settings'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})
