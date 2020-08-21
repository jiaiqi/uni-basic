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
	Vue.prototype.isArray = (e) => {
		return Array.isArray(e)
	}
	// url解码
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
	// 是否是有效值
	Vue.prototype.isInvalid = function(e) {
		if (e === '' || e === null || e === undefined) {
			return false
		} else {
			return true
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
	// 组装请求参数
	Vue.prototype.selectRequestObjs = function(srv, cond, order) { // 给自定义方法起个名
		let selectRequestObj = {}
		selectRequestObj['serviceName'] = ''
		selectRequestObj['colNames'] = ['*']
		selectRequestObj['condition'] = []
		if (srv) {
			selectRequestObj['serviceName'] = srv
		}
		if (cond) {
			selectRequestObj['condition'] = cond
		}
		if (order) {
			selectRequestObj['order'] = order
		}
		return selectRequestObj
	}
	/**
	 * @param {String} srv - 服务名(serviceName)
	 * @param {String} srvType 
	 * @param {String} pageType  // use_type 取值
	 * @param {String} app 
	 */
	Vue.prototype.getServiceV2 = async function(srv, srvType, pageType, app) { // 表单信息 srvType : add | update | list | detail | select
		// use_type: detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update
		let self = this
		let appName = app || uni.getStorageSync("activeApp")
		if (srv && srvType && pageType) {
			let len = srv.lastIndexOf('_')
			let serviceName = srv.slice(0, len) + '_'
			if (srvType === 'list' || srvType === 'detail') {
				serviceName += 'select'
			} else {
				serviceName += srvType
			}
			let cols = []
			let nCols = cols.filter(item => item.service_name === serviceName && item.use_type === pageType)
			if (nCols.length === 0) {
				let req = this.selectRequestObjs()
				req.serviceName = 'srvsys_service_columnex_v2_select'
				req.colNames = ['*']
				req.condition = []
				let condObj = {}
				condObj['colName'] = 'service_name'
				condObj['ruleType'] = 'eq'
				condObj['value'] = serviceName
				req.condition[0] = JSON.parse(JSON.stringify(condObj))
				condObj['colName'] = 'use_type'
				condObj['ruleType'] = 'eq'
				condObj['value'] = pageType
				req.condition[1] = JSON.parse(JSON.stringify(condObj))
				req.order = [{}]
				req.order[0]['colName'] = 'seq'
				req.order[0]['orderType'] = 'asc'
				let url = Vue.prototype.getServiceUrl(appName, "srvsys_service_columnex_v2_select", "select", url)
				url = url + "?colsel_v2=" + serviceName
				const response = await this.$http.post(url, req)
				if (response.data.data) {
					response.data.data.use_type = pageType
					if ('rowButton' in response.data.data) {
						// response.data.data._footerBtns = this.getFooterBtns(response.data.data.rowButton)
					}
					// 第一次拿到，缓存
					let pageconfig = Vue.prototype.getPageConfig(response.data.data, pageType)
					// self.$store.commit('setSrvCol', pageconfig)
					return pageconfig
				}
			} else {
				return nCols[0]
			}
		} else {
			return false
		}
	}
	/**
	 * @param {String} v2res  V2 请求原始数据
	 */
	Vue.prototype.getPageConfig = function(v2res, useType) {
		let pageConfigs = v2res || false
		if (pageConfigs) {
			pageConfigs["_fieldInfo"] = Vue.prototype.getFieldInfo(v2res.srv_cols, useType)
			// pageConfigs["_fieldInfo"] = Vue.prototype.arraySort(pageConfigs["_fieldInfo"], "seq")
			if (useType === 'list') {
				pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton, useType)
				pageConfigs["_rowButtons"] = Vue.prototype.getRowButton(v2res.rowButton, useType)
			}
			if (useType === 'treelist') {
				// pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton)
				pageConfigs["_rowButtons"] = Vue.prototype.getButtonInfo(v2res.rowButton, useType)
				pageConfigs["_handerButtons"] = Vue.prototype.getButtonInfo(v2res.gridButton, useType)
			} else if (useType === 'update' || useType === 'add' || useType === 'detail') {
				pageConfigs["_formButtons"] = Vue.prototype.getButtonInfo(v2res.formButton, useType)
			}
			console.log("pageConfigs", pageConfigs)
			return pageConfigs
		} else {
			return false
		}
	}
	Vue.prototype.getRowButton = (buttons, type) => {
		if (!buttons || !Array.isArray(buttons) || buttons.length < 1) return
		let button = JSON.parse(JSON.stringify(buttons))
		button = button.filter(btn => {
			if (btn.button_type == 'edit' || btn.button_type == 'delete' || btn.button_type == 'customize') {
				return btn
			}
		})
		return button
	}
	/** 封装 field 的配置信息
	 * @param {String} srvCol  cols 数组
	 * @param {String} useType userType,页面类型
	 */
	Vue.prototype.getFieldInfo = function(srvCol, useType) {
		let cols = srvCol
		let fieldInfo = {}
		switch (useType) {
			// 统一根据页面类型 过滤字段显示 === 2 暂不支持
			case "add":
				cols = cols.filter((item, index) => {
					// if (item.in_add !== 0) {
					if (item.in_add === 1 || item.in_add == 2) {
						if (item.in_add === 2) {
							// item.display = false
						}
						return item
					}
				})
				break;
			case "update":
				cols = cols.filter((item, index) => {
					if (item.in_update === 1) {
						return item
					}
				})
				break;
			case "detail":
				cols = cols.filter((item, index) => {
					// if (item.in_detail !== 0) {
					if (item.in_detail === 1) {
						return item
					}
				})
				break;
			default:
				break;
		}
		cols = cols.map((item, index) => {
			fieldInfo = {
				column: "",
				label: "",
				defaultValue: null,
				isRequire: null,
				type: null,
			}

			fieldInfo.column = item.columns
			fieldInfo.label = item.label
			fieldInfo.seq = item.seq
			fieldInfo.option_list_v2 = item.option_list_v2
			fieldInfo.bx_col_type = item.bx_col_type
			fieldInfo.redundant = item.redundant
			fieldInfo.col_type = item.col_type
			fieldInfo.section = item.section
			fieldInfo.validators = item.validators

			// col_type 转换 表单组件 type 
			if (item.col_type === "String" || item.col_type === "TelNo" || item.col_type === 'IdNo') {
				fieldInfo.type = "input"
			} else if (item.col_type === "DateTime") {
				fieldInfo.type = "dateTime"
			} else if (item.col_type === "FileList") {
				fieldInfo.type = "file"
				if (item.columns === "identity_image" || item.columns === "id_card_photo") {
					if (item.more_config) {
						try {
							let settings = JSON.parse(item.more_config)
							fieldInfo.settings = settings
						} catch (e) {
							//TODO handle the exception
						}
					} else {
						fieldInfo.moreConfig = {
							fieldType: "id_photo"
						}
						// id_photo
					}
				}
				fieldInfo.srvInfo = {
					tableName: item.table_name,
					appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item.table_name.indexOf("_"))
				}
			} else if (item.col_type === "Image") {
				// } else if (item.col_type === "Image" || item.col_type === "FileList") {
				fieldInfo.type = "images"
				if (item.columns === "identity_image" || item.columns === "id_card_photo") {
					if (item.more_config) {
						try {
							let settings = JSON.parse(item.more_config)
							fieldInfo.settings = settings
						} catch (e) {
							//TODO handle the exception
						}
					}
				}
				fieldInfo.srvInfo = {
					tableName: item.table_name,
					appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item.table_name.indexOf("_"))
				}
			} else if (item.col_type === "Enum" || item.col_type === "Dict") {
				fieldInfo.type = "radioFk"
				fieldInfo.options = item.option_list_v2
			} else if (item.col_type === "Set") {
				fieldInfo.type = "checkboxFk"
				fieldInfo.options = item.option_list_v2
			} else if (item.col_type === "MultilineText") {
				fieldInfo.type = "textarea"
				// fieldInfo.type = "input"
			} else if (item.col_type === "Money" || item.col_type === "Float") {
				fieldInfo.type = "digit"
			} else if (item.col_type === "Integer" || item.col_type === "int") {
				fieldInfo.type = "number"
			} else if (item.bx_col_type === "fk" && item.col_type !== "User") {
				fieldInfo.type = "treeSelector"
				if (item.columns === 'area_id') {
					fieldInfo.type = "cascader"
					if (fieldInfo.option_list_v2) {
						fieldInfo.srvInfo = fieldInfo.option_list_v2
						fieldInfo.showText = ''
					} else {
						fieldInfo.srvInfo = {
							serviceName: 'srvconfig_area_adj_select',
							appNo: 'config',
							isTree: true,
							column: 'path_name',
							showCol: 'path_name', //要展示的字段
						}
					}
				}
			} else if (item.col_type === "User") {
				fieldInfo.type = "treeSelector"
				fieldInfo.option_list_v2 = {
					"refed_col": "user_no",
					"srv_app": "sso",
					"serviceName": "srvsso_user_select",
					"key_disp_col": "user_disp"
				}
				fieldInfo.srvInfo = {
					serviceName: 'srvsso_user_select',
					appNo: 'sso',
					isTree: false,
					column: 'user_no',
					showCol: 'real_name', //要展示的字段
				}
			} else if (item.col_type === 'fk' && item.bx_col_type === 'string' && fieldInfo.option_list_v2) {
				fieldInfo.srvInfo = fieldInfo.option_list_v2
				fieldInfo.showText = ''
				fieldInfo.type = "treeSelector"
			} else {
				fieldInfo.type = item.col_type
			}
			if (item.more_config) {
				let config = JSON.parse(item.more_config)
				if (config.dataType === 'area-tree') {
					fieldInfo.type = "cascader"
					fieldInfo.srvInfo = {
						serviceName: 'srvconfig_area_adj_select',
						appNo: 'config',
						isTree: true,
						column: 'path_name',
						showCol: 'path_name', //要展示的字段
					}
					if (config.column) {
						fieldInfo.srvInfo.column = config.column
					}
					if (config.parent_no) {
						fieldInfo.srvInfo.parent_no = config.parent_no
					}
				}
				if (config.fieldType === 'id_photo') {
					fieldInfo.type = 'images'
					fieldInfo.fieldType = "id_photo"
					fieldInfo.srvInfo = {
						tableName: item.table_name,
						appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item.table_name.indexOf("_"))
					}
				}
			}
			switch (useType) {
				case "add":
					fieldInfo.showExp = (item.in_add === 1)
					fieldInfo.display = (item.in_add === 1)
					fieldInfo.in_add = item.in_add
					break;
				case "update":
					fieldInfo.showExp = (item.in_update === 1)
					fieldInfo.display = (item.in_update === 1)
					fieldInfo.in_update = item.in_update
					break;
				case "list":
					fieldInfo.showExp = (item.in_list === 1)
					fieldInfo.display = (item.in_list === 1)
					break;
				case "detail":
					fieldInfo.showExp = (item.in_detail === 1)
					fieldInfo.display = (item.in_detail === 1)
					break;
				case "proclist":
					fieldInfo.showExp = (item.in_list === 1)
					fieldInfo.display = (item.in_list === 1)
					break;
				case "cond":
					break;
				default:
					break;
			}
			// 处理字段统一属性
			fieldInfo.disabled = item.updatable === 0 ? true : false; //字段是否冻结
			if (item.updatable === 0 && item.updatable_add === 1 && useType === 'add') {
				fieldInfo.disabled = false
			}
			fieldInfo._validators = Vue.prototype.getValidators(item.validators, item.validators_message)
			fieldInfo._validator_obj = Vue.prototype.getValidators(item.validators, item.validators_message)
			fieldInfo.isRequire = fieldInfo._validators.required
			fieldInfo.value = null //初始化value
			fieldInfo._colDatas = item //保存原始data
			if (item.more_config && typeof item.more_config == "string") {
				try {
					let moreConfig = JSON.parse(item.more_config)
					fieldInfo.moreConfig = moreConfig
					if (moreConfig.formulaShow) {
						fieldInfo.formulaShow = moreConfig.formulaShow
					}
					if (moreConfig.calcAttr) {
						fieldInfo.calcAttr = moreConfig.calcAttr
					}
				} catch (e) {
					console.error(e)
				}
			}
			if (item.init_expr) {
				item.init_expr = item.init_expr.replace(/\'/ig, '')
				fieldInfo.defaultValue = item.init_expr
				if (item.col_type === 'Enum' || item.col_type === 'Dict') {
					fieldInfo.value = fieldInfo.defaultValue
				}
			}
			return fieldInfo
		})
		return cols
	}
	/** 封装按钮的配置信息
	 * @param {String} buttons  按钮数据
	 */
	Vue.prototype.getButtonInfo = function(buttons, pageType) {
		let cols = buttons
		let buttonInfo = {}
		cols = cols.filter((item, index) => {
			switch (pageType) {
				case "treelist":
					if ((item.button_type === "addchild" || item.button_type === "edit" || item.button_type === "delete" ||
							item.button_type === "add") && item.permission) {
						return item
					}
					break;
				case "list":
					if ((item.button_type === "addchild" || item.button_type === "edit" || item.button_type === "delete" ||
							item.button_type === "add" || item.button_type === "customize") && item.permission) {
						return item
					}
					break;
				case "add":
					if ((item.button_type === "reset" || item.button_type === "submit") && item.permission) {
						return item
					}
					break;
				case "update":
					if ((item.button_type === "reset" || item.button_type === "edit") && item.permission) {
						return item
					}
					break;
				case "detail":
					if ((item.button_type === "customize") && item.permission) {
						if (item.operate_params && typeof item.operate_params === 'string') {
							try {
								item.operate_params = JSON.parse(item.operate_params)
							} catch (e) {
								console.warn(e)
								//TODO handle the exception
							}
							return item
						}
					}
					break;
				default:
					break;
			}
		})
		return cols
	}
	// 获取图片路径
	Vue.prototype.getFilePath = async function(e) {
		let url = Vue.prototype.getServiceUrl('file', 'srvfile_attachment_select', 'select')
		let req = {
			"serviceName": "srvfile_attachment_select",
			"colNames": ["*"],
			"condition": [{
				"colName": "file_no",
				"value": e,
				"ruleType": "eq",
			}, {
				"colName": "is_delete",
				"value": "1",
				"ruleType": "eq",
			}, ]
		}
		if (e) {
			let response = await this.$http.post(url, req);
			console.log('srvfile_attachment_select', response);
			if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
				return response.data.data
			}
		}
	}
	/**
	 * 树形数据封装
	 */
	Vue.prototype.treeReform = function(e, pidcol, idcol) {
		// 
		let data = Vue.prototype.deepClone(e)
		let to1Data = e.filter((item, index) => {
			return item[pidcol] === null || item[pidcol] === ""
		})
		let to2Data = e.filter((item, index) => {
			return item[pidcol] !== null || item[pidcol] === ""
		})
		let reform = function(allData, pd, id, data) {
			// 根据顶级节点组装数有子节点
			let datas = Vue.prototype.deepClone(data) // 当前级别
			let aDatas = Vue.prototype.deepClone(allData) // 剩余data
			for (let i = 0; i < datas.length; i++) {
				let child = []
				for (let j = 0; j < aDatas.length; j++) {
					if (datas[i][id] === aDatas[j][pd]) {
						child.push(aDatas[j])
						aDatas.slice(j, 1)
					}
				}
				if (child.length > 0) {
					datas[i]["_childNode"] = reform(aDatas, pd, id, child)
				} else {
					datas[i]["_childNode"] = child
				}
			}
			return datas
		}
		to1Data = reform(to2Data, pidcol, idcol, to1Data)
		return to1Data
	}
	/**
	 * 普通请求方法封装
	 * @param {String} optionType -操作类型(select||operate||add...)
	 * @param {String} srv -服务名 serviceName
	 * @param {Object} req -请求参数
	 * @param {String} app 
	 */
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
	 * 封装配置的校验信息
	 *  @param {String} vds - col 配置的 validators
	 *  @param {String} msg - col 配置的 validators_message
	 */
	Vue.prototype.getValidators = function(vds, msg) { // 获取校验信息返回组件data
		if (vds !== null && msg !== null) {
			let str = vds
			console.log('vds', vds)
			let getStr = function(val, state, end) {
				if (val.length > state.length + end.length) {
					let s = val.indexOf(state)
					if (s === -1) {
						return ''
					} else {
						let nval = val.slice(s + state.length, val.length)
						let e = nval.indexOf(end)
						let str = nval.slice(0, e)
						if (e === -1) {
							str = nval.slice(0)
						}
						return str
					}
				} else {
					return ''
				}
			}
			let Validators = {}
			let reg = /required/gi
			Validators['max'] = getStr(str, 'ngMaxlength=', ';').length > 0 ? parseInt(getStr(str, 'ngMaxlength=', ';')) :
				null
			Validators['min'] = getStr(str, 'ngMinlength=', ';').length > 0 ? parseInt(getStr(str, 'ngMinlength=', ';')) :
				null
			Validators['reg'] = getStr(str, 'ngPattern=', ';')
			Validators['required'] = reg.test(str)
			Validators['msg'] = getStr(msg, 'ngPattern=', ';')
			Validators['isType'] = function(e) {
				let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
				if (reg.test(e)) {
					let obj = {
						valid: reg.test(e),
						msg: "有效"
					}
					return obj
				} else {
					let msgs = getStr(msg, 'ngPattern=', ';')
					msgs = msgs === '' ? '信息有误' : msgs
					let obj = {
						valid: reg.test(e),
						msg: msgs
					}
					return obj
				}
			}
			return Validators
		} else if (vds && !msg) {
			let reg = /required/gi
			let Validators = {}
			Validators['required'] = reg.test(vds)
			return Validators
		} else {
			return false
		}
	}
	Vue.prototype.isType = function(e) {
		let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
		if (reg.test(e)) {
			let obj = {
				valid: reg.test(e),
				msg: "有效"
			}
			return obj
		} else {
			let msgs = getStr(msg, 'ngPattern=', ';')
			msgs = msgs === '' ? '信息有误' : msgs
			let obj = {
				valid: reg.test(e),
				msg: msgs
			}
			return obj
		}
	}
	Vue.prototype.deepClone = function(obj) {
		// 深拷贝
		function isObject(o) {
			return (typeof o === 'object' || typeof o === 'function') && o !== null
		}
		if (!isObject(obj)) {
			console.log('非对象', obj)
			throw new Error('非对象', obj)
		}
		let isArray = Array.isArray(obj)
		let newObj = isArray ? [...obj] : { ...obj
		}
		Reflect.ownKeys(newObj).forEach(key => {
			newObj[key] = isObject(obj[key]) ? Vue.prototype.deepClone(obj[key]) : obj[key]
		})
		return newObj
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
	}
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
				value: "APPNO20200107181133"
			}]
		};
		let res = await Vue.prototype.onRequest(optionType, srv, req, app);
		if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
			let wxUser = res.data.data[0];
			uni.setStorageSync('backWxUserInfo', wxUser);
			console.log('微信用户信息：', wxUser)
			// if (!wxUser.nickname) {
			// 	if (userInfo) {
			// 		Vue.prototype.setWxUserInfo(userInfo)
			// 	}
			// }
		} else if (userInfo) {
			console.log('未获取到微信用户信息')
			// Vue.prototype.setWxUserInfo(userInfo)
		}
	}
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
	Vue.prototype.selectRealNameInfo = async function(num = 0) {
		// 从实名认证信息表中查找当前帐号是否有实名认证信息
		const url = this.getServiceUrl('spocp', 'srvspocp_auth_personal_info_select', 'select');
		let user_info = uni.getStorageSync('login_user_info');
		let req = {
			serviceName: 'srvspocp_auth_personal_info_select',
			colNames: ['*'],
			condition: [{}],
			page: {
				pageNo: 1,
				rownumber: 10
			},
		};
		if (user_info.user_no) {
			req.condition = [{
				colName: 'auth_user_no',
				value: user_info.user_no,
				ruleType: 'eq'
			}];
		} else {
			console.warn('未发现当前用户登录信息');
			return;
		}
		if ((num || num === 0) && num > 3) {
			uni.setStorageSync('realNameInfo', {
				sataus: 'fail',
				msg: `查询到用户实名信息失败三次及三次以上`
			});
			return false;
		}
		let res = await this.$http.post(url, req);
		if (res.data.state === 'SUCCESS') {
			if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
				let realNameInfo = {
					status: 'success',
					data: res.data.data[0],
					_merchant_user: res.data._merchant_user
				}
				uni.setStorageSync('realNameInfo', realNameInfo);
				console.log('用户信息:', realNameInfo);
				return realNameInfo;
			} else {
				console.log('未查询到用户实名信息:', res.data);
				uni.setStorageSync('realNameInfo', {
					sataus: 'fail',
					msg: '未查询到用户实名信息'
				});
				uni.showModal({
					title: '提示',
					content: '未发现当前登录用户实名认证信息,点击确定按钮进行实名认证',
					showCancel: false,
					success(res) {
						if (res.confirm) {
							Vue.prototype.setBackUrl()
							uni.redirectTo({
								url: '/pages/specific/addInfo/addInfo'
							});
						}
					}
				});
			}
		} else {
			uni.setStorageSync('realNameInfo', {
				sataus: 'fail',
				msg: `查询到用户实名信息失败${num}次`
			});
			num += 1;
			this.selectRealNameInfo(num);
			uni.showToast({
				title: res.data.resultMessage,
				icon: 'none'
			});
		}
	}
	Vue.prototype.setBackUrl = function() {
		let path = window.location.href
		// ?及?之后的字符
		let query = window.location.search
		let index = path.lastIndexOf('/pages/')
		if (index !== -1) {
			let backUrl = path.substring(index) + query
			uni.setStorageSync('backUrl', backUrl)
		} else {
			console.log('没有path' + path);
		}
	}
}

export default install
