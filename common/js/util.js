import {
	config,
	api
} from 'common/js/config.js'
import fly from '@/common/js/http.js' // fly 请求拦截

const install = (Vue, options) => {
	Vue.prototype.$http = fly
	Vue.prototype.$config = config
	Vue.prototype.$api = api
	Vue.prototype.onRequest = async function(optionType, srv, req, app) {
		let self = this
		let reqType = optionType
		if (optionType === "add" || optionType === "update") {
			reqType = optionType
		} else if (optionType === "select") {

		}

		let url = Vue.prototype.getServiceUrl(app || uni.getStorageSync("activeApp"), srv, optionType)
		return self.$http.post(url, req)
	}

	/**
	 * @param {String} app 
	 * @param {String} srv - 服务名(serviceName)
	 * @param {String} srvType 
	 * @param {String} url - 协议+ip+端口
	 */
	Vue.prototype.getServiceUrl = function(app, srv, srvType, url) {
		// 获取转换URL app, srv, srvType, url
		let singleApp = this.$api.singleApp

		let urlVal = url || this.$api.srvHost
		let appVal = app
		if (singleApp) {
			appVal = this.$api.appName
		} else {
			appVal = uni.getStorageSync('activeApp')
		}
		if (app) {
			appVal = app
		}
		let srvTypeVal = srvType
		let srvVal = srv
		console.log("url:", urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal)
		return urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal
	}

	// 小程序、公众号静默登录
	Vue.prototype.verifyLogin = async (code) => {
		let res = await api.verifyLogin(code)
		debugger
		let resData = res;
		let loginMsg = {
			bx_auth_ticket: resData.bx_auth_ticket,
			expire_time: resData.expire_time
		};
		let expire_timestamp = parseInt(new Date().getTime() / 1000) + loginMsg.expire_time; //过期时间的时间戳(秒)
		uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
		uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
		uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
		uni.setStorageSync('isLogin',true)
	}
}

export default install
