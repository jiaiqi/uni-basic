<template>
	<view class="cu-card articles " style="min-height: 100vh;height: auto;">
		<view class="cu-item" :class="{ show: showItem }">
			<view>
				<bxform
					:service="serviceName"
					ref="bxForm"
					:pageType="type"
					:defaultCondition="defaultCondition"
					:BxformType="type"
					:fields="fields"
					v-if="fields.length > 0"
					@onreset="resetForm"
					@changeFieldModel="changeFieldModel"
					@toPage="toPage"
					:moreConfig="colsV2Data && colsV2Data.more_config ? colsV2Data.more_config : null"
				></bxform>
				<bxButtons :buttons="buttons" class="button-box" @on-button-change="onButton($event)" v-if="buttons && buttons.length > 0 && formDisabled != true"></bxButtons>
			</view>
		</view>
	</view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
import bxButtons from '@/components/bx-buttons/bx-buttons.vue';
export default {
	components: { bxform, bxButtons },
	data() {
		return {
			fields: [],
			loadedType: 'srvV2',
			colsV2Data: null,
			type: '',
			serviceName: '',
			condition: [],
			defaultCondition: [],
			params: {},
			formData: {},
			defaultVal: {},
			childService: [], // 子表
			hasChildService: false, //是否拥有子表
			showSublist: true, //显示子表
			formDisabled: false,
			showItem: false,
			photosData: null
		};
	},
	watch: {
		defaultVal: {
			deep: true,
			handler(newValue, oldValue) {
				let cond = this.condition.length > 0 ? this.condition : null;
				if (!this.photosData) {
					this.getFieldsV2(cond);
				}
			}
		}
	},
	computed: {
		buttons: function() {
			let buttons = [];
			let submitBtn = {
				del_flag: '否',
				page_type: '增加',
				button_name: '提交',
				button_type: 'submit',
				always_show: false,
				permission: true,
				client_type: 'PC,APP',
				biz_path: '/syscore/',
				application: 'spocp',
				is_public: true,
				service_name: 'srvspocp_merchant_add',
				id: 18,
				page_area: '底部按钮',
				seq: 100
			};
			buttons = [submitBtn, ...buttons];
			let data = {};
			if (Array.isArray(this.fields)) {
				this.fields.forEach(item => {
					data[item['column']] = item['value'];
				});
				let fieldModel = data;
			}
			return buttons;
		}
	},
	created() {
		// #ifdef H5
		const destApp = this.$route.query.destApp;
		if (destApp) {
			uni.setStorageSync('activeApp', destApp);
		}
		// #endif
	},
	onShow() {
		// let self = this;
		// let condition = this.condition;
		// if (this.type === 'detail' || this.type === 'update') {
		// 	this.getDetailfieldModel().then(res => {
		// 		if (!this.photosData) {
		// 			this.defaultVal = res;
		// 		}
		// 		if (this.params.formDisabled == true) {
		// 			this.formDisabled = true;
		// 		}
		// 		uni.$on('sendDefaultVal', e => {
		// 			Object.keys(e).forEach(key => {
		// 				self.$set(self.defaultVal, key, e[key]);
		// 			});
		// 			this.photosData = e;
		// 			this.getFieldsV2(condition);
		// 		});
		// 	});
		// } else {
		// 	uni.$on('sendDefaultVal', e => {
		// 		Object.keys(e).forEach(key => {
		// 			self.$set(self.defaultVal, key, e[key]);
		// 		});
		// 		this.photosData = e;
		// 	});
		// 	if (this.params.formDisabled == true) {
		// 		this.formDisabled = true;
		// 	}
		// 	this.condition = this.params.condition;
		// 	let cond = [];
		// 	if (this.params.cond && Array.isArray(this.params.cond) && this.params.cond.length > 0) {
		// 		cond = this.params.cond.forEach(item => {
		// 			if (item.colName === 'openid' && item.value === 'user_no') {
		// 				item.value = uni.getStorageSync('login_user_info').user_no;
		// 			}
		// 		});
		// 		this.condition = cond;
		// 	}
		// 	this.getFieldsV2(condition);
		// }
	},
	onLoad() {
		this.serviceName = 'srvspocp_merchant_user_reg';
		this.type = 'add';
		this.setBackUrl();
		this.selectRealNameInfo().then(res => {
			if (res) {
				if (res.data && res.data.status === 'success' && res.data._merchant_user) {
					uni.showModal({
						title: '提示',
						content: '您已经是商户负责人了,即将跳转到用户首页',
						showCancel: false,
						success(res) {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/specific/index/index'
								});
							}
						}
					});
				} else {
					this.getFieldsV2(this.condition);
				}
			} else {
				uni.showModal({
					title: '提示',
					content: '请先进行实名认证',
					showCancel: false,
					success(res) {
						if (res.confirm) {
							uni.redirectTo({
								url: '/pages/specific/addInfo/addInfo'
							});
						}
					}
				});
			}
		}); 
	},

	methods: {
		resetForm(e) {
			// 重置表单
			this.fields = null;
			this.fields = this.deepClone(e);
		},
		toChildList(e) {
			let data = this.deepClone(e);
			let formData = this.defaultVal;
			let condition = [{ colName: e.foreign_key.column_name, ruleType: 'eq', value: formData[e.foreign_key.referenced_column_name] }];
			if (e.foreign_key && e.foreign_key.more_config && e.foreign_key.more_config.targetType && formData[e.foreign_key.referenced_column_name]) {
				let targetType = e.foreign_key.more_config.targetType;
				if (targetType === 'list') {
					uni.navigateTo({
						url: '/pages/list/list?serviceName=' + e.service_name + '&cond=' + JSON.stringify(condition)
					});
				} else if (targetType === 'detail') {
					if (e.childData && e.childData.data && e.childData.data.length > 0) {
						let params = {
							type: 'update',
							formDisabled: true,
							condition: [
								{
									colName: 'id',
									ruleType: 'in',
									value: e.childData.data[0].id
								}
							],
							serviceName: e.service_name
							// "defaultVal": row
						};
						uni.navigateTo({
							url: '/pages/formPage/formPage?params=' + JSON.stringify(params)
						});
					} else {
						uni.showModal({
							title: '提示',
							content: '暂无数据，是否添加数据',
							success(res) {
								if (res.confirm) {
									let params = {
										type: 'add',
										serviceName: e.service_name.replace('_select', '_add')
										// defaultVal:formData
									};
									// referenced_column_name //被引用的字段
									// column //子表字段
									console.log(e);
									if (e.foreign_key && e.foreign_key.referenced_column_name && e.foreign_key.column_name) {
										params.defaultCondition = [
											{
												colName: e.foreign_key.referenced_column_name,
												ruleType: 'eq',
												value: formData[e.foreign_key.column_name]
											}
										];
									}
									uni.navigateTo({
										url: '/pages/formPage/formPage?params=' + JSON.stringify(params)
									});
								}
							}
						});
					}
				}
			} else {
				uni.navigateTo({
					url: '/pages/list/list?serviceName=' + e.service_name + '&cond=' + JSON.stringify(condition)
				});
			}
		},
		toPage(e) {
			console.log(e);
			if (this.params) {
				e += '&params=' + JSON.stringify(this.params);
			}
			uni.navigateTo({
				url: e
			});
		},
		changeFieldModel(e) {
			if (e) {
				this.formData = this.deepClone(e);
			}
		},
		async selectList(item) {
			let app = uni.getStorageSync('activeApp');
			let url = this.getServiceUrl(app, item.service_name, 'select');
			let formData = this.defaultVal;
			if (item.foreign_key && item.foreign_key.referenced_column_name && formData[item.foreign_key.referenced_column_name]) {
				let req = {
					serviceName: item.service_name,
					colNames: ['*'],
					condition: [{ colName: item.foreign_key.column_name, ruleType: 'eq', value: formData[item.foreign_key.referenced_column_name] }],
					page: { pageNo: 1, rownumber: 5 },
					order: []
				};
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					return { data: res.data.data, page: res.data.page };
				} else {
					return res.data.state;
				}
			} else {
				return false;
			}
		},
		getFieldsV2: async function(condition) {
			let app = uni.getStorageSync('activeApp');
			let type = '';
			if (this.formDisabled) {
				type = 'detail';
			}
			let colVs = await this.getServiceV2(this.serviceName, 'reg', type ? type : this.type, app);
			if (!colVs) {
				return;
			}
			if (this.formDisabled) {
				colVs._fieldInfo.forEach(item => (item.disabled = true));
			}
			if (colVs && colVs.child_service && Array.isArray(colVs.child_service) && colVs.child_service.length > 0) {
				// 有子表
				this.hasChildService = true;
				this.childService = colVs.child_service;
				this.childService.forEach((item, index) => {
					this.selectList(item).then(res => {
						item.childData = res;
						if (res.data && res.data.length > 0) {
							item.data = res.data[0];
						}
						if (item.foreign_key && item.foreign_key.more_config && typeof item.foreign_key.more_config === 'string') {
							try {
								item.foreign_key.more_config = JSON.parse(item.foreign_key.more_config);
							} catch (e) {
								//TODO handle the exception
								console.log(e);
							}
						}
						this.$set(this.childService, index, item);
					});
				});
				this.childService.filter(item => item.childData);
			}
			if (!this.navigationBarTitle) {
				uni.setNavigationBarTitle({
					title: colVs.service_view_name
				});
			}
			if (colVs.more_config) {
				if (typeof colVs.more_config === 'string') {
					try {
						colVs.more_config = JSON.parse(colVs.more_config);
					} catch (e) {
						//TODO handle the exception
						console.log(e);
					}
				}
			}
			this.colsV2Data = colVs;
			this.showItem = true;
			let self = this;
			switch (this.type) {
				case 'update':
					this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.defaultVal);
					break;
				case 'add':
					let valueArr = Object.values(this.formData);
					if (valueArr.length > 0) {
						Object.keys(this.formData).forEach(item => {
							colVs._fieldInfo.forEach(field => {
								if (item === field.column) {
									field['value'] = this.formData[item];
								}
							});
						});
					}
					if (this.defaultCondition && Array.isArray(this.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
						console.log('this.defaultCondition', this.defaultCondition, colVs._fieldInfo);
						let arr = [];
						this.defaultCondition.forEach(cond => {
							colVs._fieldInfo.forEach(field => {
								if (cond.colName === field.column) {
									field['value'] = cond['value'];
									field['disabled'] = true;
								}
							});
						});
					}
					if (condition && Array.isArray(condition)) {
						condition.forEach(item => {
							colVs._fieldInfo.forEach(field => {
								if (field.column === item.colName) {
									field.condition = item.value;
								}
								if (typeof item.value !== 'string' && Array.isArray(item.value)) {
									item.value.forEach(cond => {
										if (cond.colName === cond.value && field.column === cond.value) {
											field['display'] = false;
										}
									});
								}
								if (this.params.defaultVal) {
									// 赋默认值
									// field.value = this.params.defaultVal[field.column]
								}
							});
						});
					}
					if (Object.values(this.defaultVal).length > 0) {
						this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.defaultVal);
					} else {
						this.fields = colVs._fieldInfo;
					}
					this.fields.forEach(item => {
						if (item.column === 'auth_user_no') {
							item.disabled = true;
							item.value = uni.getStorageSync('login_user_info').user_no;
						}
						if (item.column === 'merchant_name') {
							item.type = 'treeSelector';
							item.srvInfo = {
								serviceName: 'srvspocp_merchant_name_select',
								appNo: 'spocp',
								isTree: false,
								column: 'merchant_name',
								showCol: 'merchant_name', //要展示的字段
								canInput: true
							};
							item.option_list_v2 = {
								refed_col: 'merchant_name',
								show_as_pair: false,
								srv_app: 'spocp',
								serviceName: 'srvspocp_merchant_name_select',
								key_disp_col: 'merchant_name'
							};
						}
					});
					break;
				case 'detail':
					this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.defaultVal);
					break;
				default:
					break;
			}
		},
		// async selectRealNameInfo(num = 0) {
		// 	// 从实名认证信息表中查找当前帐号是否有实名认证信息
		// 	const url = this.getServiceUrl('spocp', 'srvspocp_auth_personal_info_select', 'select');
		// 	let user_info = uni.getStorageSync('login_user_info');
		// 	let req = { serviceName: 'srvspocp_auth_personal_info_select', colNames: ['*'], condition: [{}], page: { pageNo: 1, rownumber: 10 }, order: [] };
		// 	if (user_info.user_no) {
		// 		req.condition = [
		// 			{
		// 				colName: 'auth_user_no',
		// 				value: user_info.user_no,
		// 				ruleType: 'eq'
		// 			}
		// 		];
		// 	} else {
		// 		console.warn('未发现当前用户登录信息');
		// 		return;
		// 	}
		// 	if ((num || num === 0) && num > 3) {
		// 		uni.setStorageSync('realNameInfo', {
		// 			sataus: 'fail',
		// 			msg: `查询到用户实名信息失败三次及三次以上`
		// 		});
		// 		return;
		// 	}
		// 	let res = await this.$http.post(url, req);
		// 	if (res.data.state === 'SUCCESS') {
		// 		if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
		// 			uni.setStorageSync('realNameInfo', {
		// 				status: 'success',
		// 				data: res.data.data[0],
		// 				_merchant_user:res.data._merchant_user
		// 			});
		// 			console.log('用户信息:', res.data.data[0]);
		// 			return res.data.data[0];
		// 		} else {
		// 			uni.setStorageSync('realNameInfo', {
		// 				sataus: 'fail',
		// 				msg: '未查询到用户实名信息'
		// 			});
		// 			uni.showModal({
		// 				title: '提示',
		// 				content: '未发现当前登录用户实名认证信息,点击确定跳转到实名认证页面',
		// 				success(res) {
		// 					if (res.confirm) {
		// 						uni.redirectTo({
		// 							url: '/pages/specific/addInfo/addInfo'
		// 						});
		// 					}
		// 				}
		// 			});
		// 		}
		// 	} else {
		// 		uni.setStorageSync('realNameInfo', {
		// 			sataus: 'fail',
		// 			msg: `查询到用户实名信息失败${num}次`
		// 		});
		// 		num += 1;
		// 		this.selectRealNameInfo(num);
		// 		uni.showToast({
		// 			title: res.data.resultMessage,
		// 			icon: 'none'
		// 		});
		// 	}
		// },
		async getDetailfieldModel() {
			let params = this.deepClone(this.params);
			let app = uni.getStorageSync('activeApp');
			params.serviceName = params.serviceName.replace('_update', '_select').replace('_add', '_select');
			let url = this.getServiceUrl(app, params.serviceName, 'select');
			const req = {
				colNames: ['*'],
				condition: params.condition,
				page: { pageNo: 1, rownumber: 5 },
				serviceName: params.serviceName
			};
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
				// this.defaultVal = res.data.data[0];
				return res.data.data[0];
			} else {
				return false;
			}
		},
		async onButton(e) {
			let data = this.$refs.bxForm.getFieldModel();
			let req = this.deepClone(data);
			let _this = this;
			switch (e.button_type) {
				case 'submit':
					console.log('addServiceName:', e.service_name);
					if (req) {
						Object.keys(req).forEach(item => {
							if (Array.isArray(req[item])) {
								req[item] = req[item].toString();
							}
						});
						req = [{ serviceName: 'srvspocp_merchant_user_reg', data: [req] }];
						let app = uni.getStorageSync('activeApp');
						let url = this.getServiceUrl(app, 'srvspocp_merchant_user_reg', 'operate');
						let res = await this.$http.post(url, req);
						this.selectRealNameInfo();
						console.log(url, res.data);
						if (res.data.state === 'SUCCESS') {
							uni.showModal({
								title: '提示',
								content: '提交成功,即将返回首页',
								showCancel: false,
								success(res) {
									if (res.confirm) {
										uni.reLaunch({
											url: _this.$api.homePath
										});
									} else {
									}
								}
							});
						} else {
							uni.showToast({
								title: res.data.resultMessage,
								icon: 'none'
							});
						}
					}
					break;
				case 'reset':
					let res = this.$refs.bxForm.onReset();
					if (res) {
						uni.showToast({
							title: '已重置'
						});
					} else {
						uni.showToast({
							title: '无效操作'
						});
					}
					break;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.sublist-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin: 50rpx 20rpx;
	.sublist-box {
		width: 100%;
		display: flex;
		border: 1px dashed #efefef;
		justify-content: space-between;
		padding: 10rpx;
		flex-wrap: wrap;
		.child-service {
			// width: 50%;
			width: calc(50% - 20rpx);
			height: 150rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 10rpx;
			margin: 10rpx;
			text-align: center;
			font-size: 12px;
			button {
				flex: 1;
			}
			.service {
				height: 100%;
				width: 100%;
				border-radius: 10rpx;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
			}
			.section_name {
				font-size: 12px;
				padding: 10rpx;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				font-size: 12px;
				display: flex;
			}
			.section_content {
				font-weight: 700;
				padding-top: 10px;
				display: flex;
				flex: 1;
				justify-content: center;
			}
		}
	}
}
.articles {
	// background-color: #c4e5ff !important;
	.cu-item {
		opacity: 0;
		margin: 0;
		.button-box {
			uni-view {
				flex: 1;
			}
			/deep/ .cu-btn {
				width: 300rpx;
			}
		}
		&.show {
			opacity: 1;
			transition: all 2s;
		}
	}
}
</style>
