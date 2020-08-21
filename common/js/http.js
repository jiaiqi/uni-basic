import Vue from 'vue'
import {
	config
} from '@/common/js/config.js'
import formateDate from '@/common/js/function/formatDate.js'
import flyio from '@/common/js/wx.js' // 引入flyio
let fly = new flyio
//添加请求拦截器
fly.interceptors.request.use((request) => {
	//给所有请求添加自定义header
	// 如果是浏览器运行的记录 请求的页面path和参数
	uni.showLoading({
		mask: true
	});
	if (uni.getStorageSync('client_env') === 'wxh5' || uni.getStorageSync('client_env') === 'web') {
		request.headers["requrl"] = window.location.pathname + window.location.search
		console.log("requrl", window.location.pathname + window.location.search, window.location)
	}
	const bxAuthTicket = uni.getStorageSync("bx_auth_ticket")
	if (bxAuthTicket) {
		console.log("bxAuthTicket", bxAuthTicket)
		request.headers["bx_auth_ticket"] = bxAuthTicket
	} else {
		uni.showToast({
			title: '没有bx_auth_ticket' + config.ticket,
			icon: "none"
		})
		uni.setStorageSync('isLogin', false)
	}
	const outTime = uni.getStorageSync("expire_timestamp") //过期时间
	const date = parseInt(new Date().getTime() / 1000)
	if (outTime) {
		const isExpired = outTime < date
		console.log('登录是否过期:', isExpired, '\n过期时间:', formateDate(new Date(outTime * 1000)), 'YYYY', date)
		if (isExpired) {
			uni.setStorageSync('isLogin', false)
			request.headers["USERlOGIN"] = "noneLogin" // normal || noneLogin
			return request
		} else {
			request.headers["USERlOGIN"] = "normal" // normal || noneLogin
			return request
		}
	} else {
		request.USERlOGIN = "normal"
		return request
	}
})
//添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
	(res) => {
		//只将请求结果的data字段返回
		uni.hideLoading()
		console.log("请求结果：", res)
		if (res.data.resultCode === "0011" || (res.request.headers.USERlOGIN && res.request.headers.USERlOGIN ===
				"noneLogin")) { //未登录或登录过期
			uni.setStorageSync('isLogin', false)
			uni.setStorageSync('stophttp', true)
			if (res.request.headers.requrl) {
				console.log('请求失败:', res.request.headers.requrl)
				// ip:prot之后的字符
				let requestUrl = decodeURIComponent(res.request.headers.requrl)
				if (res.request.headers.requrl && res.request.headers.requrl !== '/' && res.request.headers.requrl.indexOf("code") ===
					-1) {
					//  过滤无效的url
					let path = requestUrl
					let index = path.lastIndexOf('/pages/')
					if (index !== -1) {
						let backUrl = path.substring(index)
						uni.setStorageSync('backUrl', backUrl)
					} else {
						console.log('没有backurl4' + path);
						// alert('没有backurl4' + path);
					}
				}
				try {
					console.log("backUrl:", requestUrl, encodeURIComponent(requestUrl))
					uni.redirectTo({
						url: '/pages/login/login'
					})
				} catch (e) {
					console.error('请求失败', e)
					//TODO handle the exception
				}
			} else {
				uni.redirectTo({
					url: '/pages/login/login'
				})
			}
			// }
		} else if (res.data.resultCode === '0000' || res.data.state === 'FAILURE') {
			// 没有访问权限
			uni.setStorageSync('isLogin', false)
			uni.showToast({
				title: data.resultMessage
			})
			let path = window.location.pathname
			// ?及?之后的字符
			let query = window.location.search
			let index = path.lastIndexOf('/pages/')
			if (index !== -1) {
				let backUrl = path.substring(index) + query
				uni.setStorageSync('backUrl', backUrl)
				uni.redirectTo({
					url: '/pages/login/login'
				})
			} else {
				// alert('没有backurl6' + path);
				console.log('没有backurl6' + path);
			}
		} else {
			uni.setStorageSync('stophttp', false)
			let backUrl = uni.getStorageSync('backUrl')
		}
	},
	(err) => {
		//发生网络错误后会走到这里
		//return Promise.resolve("ssss")
	}
)
export default fly
