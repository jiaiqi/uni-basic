import http from './http.js'
const config = {
	host: {
		backUrl: "https://srvms.100xsys.cn", //后端接口地址
		// backUrl: "http://124.47.10.210:18103", //后端接口地址
		frontUrl: "https://wx2.100xsys.cn", // 前端服务器url(公众号、h5网页等)
		frontEndAddress: 'https://wx2.100xsys.cn',
		test: "", //测试接口
	},
	frontEndAddress: 'https://wx2.100xsys.cn/ymt/',
	backEndAddress: 'https://srvms.100xsys.cn',
	onTicket: false, //使用本地的bx_auth_ticket
	bx_auth_ticket: "",
	appName: "daq", //默认服务app
	activeApp: "daq", //当前服务app
	singleApp: false, //是否单app项目
	homePath: "/pages/public/home/home", //登录后默认要跳转到的页面
	appID: {
		// wxmp: 'wx8e6f993081f6e979',// 百想助理
		wxmp: 'wx08876efb5760ca75', //生活能力评估
		wxh5: ''
	},
	appNo: {
		wxmp: 'APPNO20200731153421', //生活能力评估微信小程序 
		wxh5: 'APPNO20200107181133', //百想助理微信公众号
	},

}
const api = {
	srvHost: config.host.backUrl,
	// 通用接口

	// 微信相关
	getAuthorization: { //获取公众号授权
		url: config.host.backUrl + '/wx/operate/srvwx_public_page_authorization',
		serviceName: 'srvwx_public_page_authorization'
	},
	accountLogin: { //公众号/小程序账号登录
		url: config.host.backUrl + 'wx/operate/srvwx_app_login',
		serviceName: 'srvwx_app_login'
	},
	verifyLogin: async (code) => {
		//公众号/小程序验证登录(静默登录)
		const url = config.host.backUrl + '/wx/operate/srvwx_app_login_verify'
		const client_env = uni.getStorageSync('client_env')
		const appNo = client_env === 'wxh5' ? config.appNo.wxh5 : client_env === 'wxmp' ? config.appNo.wxmp : ''
		const req = [{
			data: [{
				code: code,
				app_no: appNo
			}],
			serviceName: 'srvwx_app_login_verify'
		}];
		const res = await http.post(url, req)
		if (res.data.state === 'SUCCESS') {
			console.log("登录成功")
			if (Array.isArray(res.data.response) && res.data.response.length > 0) {
				return res.data.response[0]
			}
		} else {
			return res.data
		}
	}

	// 业务接口
}
export {
	config,
	api
}
