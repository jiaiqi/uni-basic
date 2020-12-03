import http from './http.js'
let env = 'develop' // develop-开发环境  production-生产环境
const config = {
	host: {
		// backUrl: "https://ymtsrv.yiyuanhealth.com", //后端接口地址
		// backUrl: "https://srvms.100xsys.cn", //后端接口地址
		backUrl: "https://wap.shuzibaota.com", //后端接口地址
		// backUrl: "http://124.47.10.210:18103", //后端接口地址
		frontUrl: "https://app.shuzibaota.com", // 前端服务器url(公众号、h5网页等)
		// frontUrl: "https://wx2.100xsys.cn", // 前端服务器url(公众号、h5网页等)
		// frontUrl: "https://ymth5.yiyuanhealth.com", // 一码通外网
		frontEndAddress: 'https://app.shuzibaota.com',
		// frontEndAddress: 'https://wx2.100xsys.cn',
		test: "", //测试接口
	},
	// frontEndAddress: "https://ymth5.yiyuanhealth.com/ymt/",
	// frontEndAddress: 'https://wx2.100xsys.cn/ymt/',
	frontEndAddress: 'https://app.shuzibaota.com/ymt/',
	// serviceAddress: 'https://ymtsrv.yiyuanhealth.com',
	// serviceAddress: 'https://srvms.100xsys.cn',
	serviceAddress: 'https://wap.shuzibaota.com',
	// backEndAddress: 'https://srvms.100xsys.cn',
	backEndAddress: 'https://wap.shuzibaota.com',
	onTicket: false, //使用本地的bx_auth_ticket
	ticket: "xabxdzkj-c4ae8492-a3e0-4b74-8974-9fa9295a0360",
	bx_auth_ticket: "",
	appName: "spocp", //默认服务app
	activeApp: "spocp", //当前服务app
	singleApp: true, //是否单app项目
	homePath: "/pages/specific/qrCode/qrCode", //登录后默认要跳转到的页面
	// homePath: "https://wx2.100xsys.cn/pages/public/index/index?website_no=WS2020041814270003&page_no=BX202004181428000003", //登录后默认要跳转到的页面
	appID: {
		// wxmp: 'wx8e6f993081f6e979',// 百想助理
		wxmp: 'wx4df80e066f039430', // 一码通外网
		// wxmp: 'wx08876efb5760ca75', //生活能力评估
		wxh5: ''
	},
	appNo: {
		wxmp: 'APPNO20200731153421', //生活能力评估微信小程序 
		// wxh5: 'APPNO20200107181133', //百想助理微信公众号
		wxh5: 'APPNO20200820082740' // 一码通外网
	},
}
if (env === 'develop') {
	// 生产环境
	config.frontEndAddress = "https://wx2.100xsys.cn/ymt/"
	config.serviceAddress = "https://srvms.100xsys.cn"
	config.appNo.wxh5 = 'APPNO20200107181133'
} else {
	// 开发环境
	config.frontEndAddress = "https://app.shuzibaota.com/ymt/"
	config.serviceAddress = 'https://wap.shuzibaota.com'
	config.appNo.wxh5 = 'APPNO20200820082740'
}
const api = {
	srvHost: config.serviceAddress,
	// 通用接口
	getFilePath: config.serviceAddress + '/file/download?filePath=', // 文件路径地址
	add: config.serviceAddress + '/bxsys/operate', // 新增
	update: config.serviceAddress + '/bxsys/operate', // 修改
	delete: config.serviceAddress + '/bxsys/operate', // 删除
	saveDraft: config.serviceAddress + '/bxsys/saveDraft', // 保存草稿
	upload: config.serviceAddress + '/file/upload', // 上传文件
	deleteFile: config.serviceAddress + '/file/delete', // 删除文件
	// 微信相关
	getSignature: config.serviceAddress + '/wx/select/srvwx_app_signature_select', //获取js-sdk签名
	getUserInfo: config.serviceAddress + '/wx/select/srvwx_basic_user_info_select', //获取用户信息
	saveShareRecord: config.serviceAddress + '/daq/add/srvdaq_record_share_add', //保存微信分享记录
	getAuthorization: { //获取公众号授权
		url: config.serviceAddress + '/wx/operate/srvwx_public_page_authorization',
		serviceName: 'srvwx_public_page_authorization'
	},
	accountLogin: { //公众号/小程序账号登录
		url: config.serviceAddress + 'wx/operate/srvwx_app_login',
		serviceName: 'srvwx_app_login'
	},
	verifyLogin: async (code) => {
		//公众号/小程序验证登录(静默登录)
		const url = config.serviceAddress + '/wx/operate/srvwx_app_login_verify'
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
