import Vue from 'vue'
import {
	config
} from '@/common/js/config.js'
import formateDate from '@/common/js/function/formatDate.js'
import flyio from '@/common/js/wx.js' // 引入flyio
let fly = new flyio
//添加请求拦截器
var loading = null
fly.interceptors.request.use((request) => {
	//给所有请求添加自定义header
	// 如果是浏览器运行的记录 请求的页面path和参数
	if (request.url.indexOf('srvdaq_orc_idcard_extraction') !== -1 || request.url.indexOf(
			'srvsso_matching_image_code_check') !== -1 || request.url.indexOf('srvsso_matching_send_node') !== -1 || request.url
		.indexOf('srvsso_matching_image_code') !== -1 || request.url.indexOf('srvspocp_user_reserve_record_select') !== -1) {
		// uni.showLoading({
		// 	mask: true,
		// 	title:'正在识别'
		// });
	} else if (request.url.indexOf('srvfile_attachment_select') !== -1) {
		// 获取文件路径
		// uni.showLoading({
		// 	mask: true
		// });
	} else {
		loading ? loading.close() : '';
		loading = Vue.prototype.$loading({
			lock: true,
			text: '加载中', //提示文字
			fullscreen: false, // 是否全屏背景
			loadingMode: "flower", //加载样式 circle-圆环 flower-...
			size: "90", //加载的图标的大小 fontsize
			textColor: "#fff", //提示文字的color
			// color:"#009688" // mode为circle时 可以设置圆环颜色
			// background: 'rgba(0, 0, 0, 0.7)' //遮罩的背景颜色
		});
	}

	if (uni.getStorageSync('client_env') === 'wxh5' || uni.getStorageSync('client_env') === 'web') {
		request.headers["requrl"] = window.location.pathname + window.location.search
		console.log("requrl", window.location.pathname + window.location.search, window.location)
	}
	const bxAuthTicket = uni.getStorageSync("bx_auth_ticket")
	if (bxAuthTicket) {
		console.log("bxAuthTicket", bxAuthTicket)
		request.headers["bx_auth_ticket"] = bxAuthTicket
	} else {
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
		if (res.request.url.indexOf('srvdaq_orc_idcard_extraction') !== -1) {} else if (res.request.url.indexOf(
				'srvfile_attachment_select') !== -1) {
			// 获取文件路径
		} else {
			loading ? loading.close() : ''
		}

		if (res.data.resultCode === "0011") { //未登录或登录过期
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
						if (backUrl.indexOf("/login/login") === -1) {
							uni.setStorageSync('backUrl', backUrl)
						}
					} else {
						console.log('没有backurl4' + path);
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
		} else if (res.data.resultCode === '0000' && res.data.state === 'FAILURE') {
			// 没有访问权限
			uni.setStorageSync('isLogin', false)
			uni.showToast({
				title: data.resultMessage
			})
		} else {
			uni.setStorageSync('stophttp', false)
			let backUrl = uni.getStorageSync('backUrl')
		}
		loading ? loading.close() : '';
	},
	(err) => {
		//发生网络错误后会走到这里
		loading ? loading.close() : '';
		if (err.status && (err.status === 429 || err.status === "429")) {
			// too many request
			uni.showToast({
				title: '当前使用人数过多，请稍后再试',
				icon: "none"
			})
		} else {
			uni.showToast({
				title: '网络错误! 请检查网络或刷新重试',
				icon: "none"
			})
		}
	}
)
export default fly
