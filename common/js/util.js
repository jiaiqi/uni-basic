import {
	config,
	api
} from 'common/js/config.js'
import fly from '@/common/js/http.js' // fly 请求拦截

const install = (Vue, options) => {
	Vue.prototype.$http = fly
	Vue.prototype.$api = { ...config,
		...api
	}
	Vue.prototype.getDecodeUrl = function(e) {
		if (Vue.prototype.isInvalid(e)) {
			let url = decodeURIComponent(e)
			console.log('getDecodeUrl 01', url)
			if (url.indexOf("%") !== -1) {
				console.log('getDecodeUrl 02', url)
				url = decodeURIComponent(e)
				Vue.prototype.getDecodeUrl(url)
			} else {
				console.log('getDecodeUrl 03', url)
				return url
			}
		} else {
			return false
		}
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
		let urlVal = url || Vue.prototype.$api.srvHost
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

	Vue.prototype.verifyLogin = async function(code) {
			// 小程序、公众号静默登录
			let res = await api.verifyLogin(code)
			let resData = res;
			let loginMsg = {
				bx_auth_ticket: resData.bx_auth_ticket,
				expire_time: resData.expire_time
			};
			let expire_timestamp = parseInt(new Date().getTime() / 1000) + loginMsg.expire_time; //过期时间的时间戳(秒)
			uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
			uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
			uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
			uni.setStorageSync('isLogin', true)
			return resData
		},
		// 查找数据库中保存的微信用户信息，如果没有,则保存该微信用户的用户信息到服务器
		Vue.prototype.getWxUserInfo = async function(userInfo) {
				//查找微信用户头像昵称
				let optionType = 'select';
				let srv = 'srvwx_basic_user_info_select';
				let app = 'wx';
				let req = {
					serviceName: 'srvwx_basic_user_info_select',
					colNames: ['*'],
					condition: [{
						colName: 'app_no',
						ruleType: 'eq',
						value: uni.getStorageSync('_appNo') ? uni.getStorageSync('_appNo') : Vue.prototype.$config.appNo.wxmp
					}]
				};
				let res = await Vue.prototype.onRequest(optionType, srv, req, app);
				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					let wxUser = res.data.data[0];
					uni.setStorageSync('backWxUserInfo', wxUser);
					if (!wxUser.nickname) {
						if (userInfo) {
							Vue.prototype.setWxUserInfo(userInfo)
						}
					}
				} else if (userInfo) {
					Vue.prototype.setWxUserInfo(userInfo)
				}
			},
			// 保存微信用户信息
			Vue.prototype.setWxUserInfo = async function(e) {
				try {
					let userInfo = typeof e === 'string' ? JSON.parse(e) : e
				} catch (err) {
					//TODO handle the exception
					console.log(err)
				}
				console.log("setWxUserInfo", userInfo)
				let url = Vue.prototype.getServiceUrl('wx', 'srvwx_basic_user_info_save', 'operate')
				let req = [{
					"serviceName": "srvwx_basic_user_info_save",
					"data": [{
						"app_no": Vue.prototype.$config.appNo.wxmp,
						"nickname": userInfo.nickname,
						"sex": userInfo.sex,
						"country": userInfo.country,
						"province": userInfo.province,
						"city": userInfo.city,
						"headimgurl": userInfo.headimgurl
					}],
				}]
				if (e) {
					let response = await this.$http.post(url, req);
					console.log('srvfile_attachment_select', response);
					if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
						return response.data.data
					}
				}
			}
}

export default install
