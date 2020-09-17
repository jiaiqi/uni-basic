<template>
	<view class="merchant-reg" style="min-height: 100vh;height: auto;">
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
			serviceName: 'srvspocp_store_select',
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
	onLoad() {
		uni.setStorageSync('activeApp', 'spocp');
		this.serviceName = 'srvspocp_store_select';
		this.type = 'add';
		this.setBackUrl();
		this.selectRealNameInfo().then(res => {
			if (res) {
				if (res.data && res.status === 'success' && res._merchant_user) {
					uni.showModal({
						title: '提示',
						content: '您已经是商户负责人了,即将跳转商户主页',
						showCancel: false,
						success(res) {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/specific/merchant/merchant'
								});
							}
						}
					});
				} else {
					this.getFieldsV2(this.condition);
				}
			} else {
				this.setBackUrl();
			}
		});
	},

	methods: {
		resetForm(e) {
			// 重置表单
			this.fields = null;
			this.fields = this.deepClone(e);
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
		getFieldsV2: async function(condition) {
			let app = 'spocp';
			let type = '';
			if (this.formDisabled) {
				type = 'detail';
			}
			let colVs = await this.getServiceV2(this.serviceName, 'add', type ? type : this.type, app);
			if (!colVs) {
				return;
			}
			if (this.formDisabled) {
				colVs._fieldInfo.forEach(item => (item.disabled = true));
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
						if (item.col_type === 'Image') {
							// item.fileNum = 1;
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
		async onButton(e) {
			let data = this.$refs.bxForm.getFieldModel();
			let req = this.deepClone(data);
			let self = this;
			switch (e.button_type) {
				case 'submit':
					console.log('addServiceName:', e.service_name);
					if (req) {
						Object.keys(req).forEach(item => {
							if (Array.isArray(req[item])) {
								req[item] = req[item].toString();
							}
						});
						let serviceName = 'srvspocp_store_add';
						req = [{ serviceName: serviceName, data: [req] }];
						let app = 'spocp';
						let url = this.getServiceUrl(app, serviceName, 'operate');
						let res = await this.$http.post(url, req);
						this.selectRealNameInfo();
						if (res.data.state === 'SUCCESS') {
							uni.showModal({
								title: '提示',
								content: '提交成功,即将返回商户首页',
								showCancel: false,
								success(res) {
									if (res.confirm) {
										uni.reLaunch({
											url: '/pages/specific/merchant/merchant'
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
.merchant-reg {
	background-position: bottom;
	background-size: 100%;
	background-repeat: no-repeat;
	.form-box {
		width: 100%;
	}
	.cu-item {
		opacity: 0;
		margin: 0;
		.button-box {
			margin: 0 auto;
			background-color: transparent;
			border-radius: 0;
			uni-view {
				flex: 1;
			}
			/deep/ .cu-btn {
				width: 300rpx;
				background: linear-gradient(to right, rgb(54, 119, 238) 0%, rgba(54, 119, 238, 0.9) 70%, rgba(54, 119, 238, 0.7) 100%);
			}
		}
		&.show {
			opacity: 1;
			transition: all 2s;
		}
	}
}
</style>
