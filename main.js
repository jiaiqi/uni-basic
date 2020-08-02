import Vue from 'vue'
import App from './App'
import util from 'common/js/util.js'
Vue.config.productionTip = false

Vue.use(util)

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
