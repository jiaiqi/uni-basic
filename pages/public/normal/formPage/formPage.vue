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
				<bxButtons :buttons="buttons" @on-button-change="onButton($event)" v-if="buttons && buttons.length > 0 && formDisabled != true"></bxButtons>
				<!-- <button class="bg-green cu-btn lg">查看列表</button> -->
				<view class="sublist-content" v-if="type === 'detaill' && childService && childService.length > 0">
					<!-- <view class="sublist-content" v-if="type === 'detail'&&hasChildService"> -->
					<view class="sublist-box" v-if="showSublist">
						<view class="child-service" v-for="item in childService" :key="item.service_name">
							<view
								class="bg-blue service"
								v-if="item.foreign_key && item.foreign_key.section_name"
								:class="{
									'bg-gray':
										item.foreign_key &&
										item.foreign_key.more_config &&
										item.foreign_key.more_config.statusColor &&
										item.foreign_key.more_config.statusColor.noStart &&
										item.childData &&
										item.childData.data &&
										item.childData.data &&
										item.childData.data.length === 0
								}"
								@click="toChildList(item)"
							>
								<!-- 标题 -->
								<text class="section_name">{{ item.foreign_key.section_name }}</text>
								<!-- 内容 -->
								<text class="section_content" v-if="item.data && item.foreign_key.more_config && item.foreign_key.more_config.resultCol">
									{{ item.data[item.foreign_key.more_config.resultCol] }}
								</text>
								<text
									class="section_content"
									v-if="!item.data || (item.data && item.foreign_key.more_config && !item.foreign_key.more_config.resultCol && !item.data[item.foreign_key.more_config.resultCol])"
								>
									未填写
								</text>
								<!-- 结论 -->
								<text class="section_verdict"></text>
							</view>
						</view>
					</view>
					<!-- 	<button class="cu-btn  bg-blue margin-tb-sm" v-if="!showSublist&&hasChildService" @click="showSublist = !showSublist">
				展开子表
				<text class="lg text-white cuIcon-down margin-left-xs"></text>
			</button>
			<button class="cu-btn  bg-blue margin-tb-sm" v-if="showSublist" @click="showSublist = !showSublist">
				收起子表
				<text class="lg text-white cuIcon-top margin-left-xs"></text>
			</button> -->
				</view>
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
			if (this.colsV2Data && this.colsV2Data._buttonInfo) {
				buttons = this.colsV2Data._buttonInfo;
				// return this.colsV2Data._buttonInfo;
			} else if (this.colsV2Data && this.colsV2Data._formButtons) {
				buttons = this.colsV2Data._formButtons;
				// return this.colsV2Data._formButtons;
			}
			let data = {};
			if (Array.isArray(this.fields)) {
				this.fields.forEach(item => {
					data[item['column']] = item['value'];
				});
				let fieldModel = data;
			}
			buttons.forEach(btn => {
				if (btn.disp_exps) {
					btn['display'] = eval(btn.disp_exps);
				}
				if (btn.operate_params) {
					let fieldData = btn.operate_params['data'];
					if (fieldData && Array.isArray(fieldData) && fieldData.length > 0) {
						fieldData = fieldData[0];
						let newData = {};
						Object.keys(fieldData).forEach(data_item => {
							let item = fieldData[data_item];
							if (item.value_type && item.value_type === 'rowData') {
								newData[data_item] = fieldModel[item.value_key];
							}
						});
						btn['requestData'] = newData;
						btn['requestCondition'] = this.condition;
					}
				}
			});
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
		let self = this;
		let condition = this.condition;
		if (this.type === 'detail' || this.type === 'update') {
			this.getDetailfieldModel().then(res => {
				if (!this.photosData) {
					this.defaultVal = res;
				}
				if (this.params.formDisabled == true) {
					this.formDisabled = true;
				}
				uni.$on('sendDefaultVal', e => {
					Object.keys(e).forEach(key => {
						self.$set(self.defaultVal, key, e[key]);
					});
					this.photosData = e;
					this.getFieldsV2(condition);
				});
			});
		} else {
			uni.$on('sendDefaultVal', e => {
				Object.keys(e).forEach(key => {
					self.$set(self.defaultVal, key, e[key]);
				});
				this.photosData = e;
			});
			if (this.params.formDisabled == true) {
				this.formDisabled = true;
			}
			this.condition = this.params.condition;
			let cond = [];
			if (this.params.cond && Array.isArray(this.params.cond) && this.params.cond.length > 0) {
				cond = this.params.cond.forEach(item => {
					if (item.colName === 'openid' && item.value === 'user_no') {
						item.value = uni.getStorageSync('login_user_info').user_no;
					}
				});
				this.condition = cond;
			}
			this.getFieldsV2(condition);
		}
	},
	onLoad(option) {
		let query = JSON.parse(decodeURIComponent(option.query ? option.query : option.params ? option.params : '{}'));
		const destApp = query.destApp;
		if (destApp) {
			uni.setStorageSync('activeApp', destApp);
		}
		if (option.serviceName) {
			query = option;
		}
		if (query.params) {
			this.params = JSON.parse(query.params);
		}
		if (query.formData) {
			try {
				this.formData = JSON.parse(decodeURIComponent(query.formData));
				console.log('formData-formPage', this.formData);
			} catch (e) {
				console.log('formData', e);
				//TODO handle the exception
			}
		}
		if(option.defaultVal){
			try{
				this.defaultVal = JSON.parse(option.defaultVal)
			}catch(e){
				//TODO handle the exception
				console.log(e)
			}
		}
		if (option.params) {
			this.params = query;
		}
		if (query.cond || query.condition) {
			let cond = '';
			if (typeof query.cond === 'string' && query.cond) {
				cond = JSON.parse(query.cond);
			}
			if (typeof query.condition === 'object') {
				cond = query.condition;
			}
			this.defaultCondition = cond
		}
		if (option.hasOwnProperty('loadedType')) {
			this.loadedType = option.loadedType;
		} else if (option.hasOwnProperty('params')) {
			this.serviceName = this.params.serviceName;
			this.type = this.params.type;
			if (this.params.defaultCondition) {
				this.defaultCondition = this.params.defaultCondition;
			}
			if (this.params.cond && Array.isArray(this.params.cond)) {
				this.condition = this.params.cond;
			}
			if (this.params.defaultVal) {
				this.defaultVal = this.params.defaultVal;
			}
			if (this.params.condition && Array.isArray(this.params.condition)) {
				this.params.condition.forEach(item=>{
					if (item.colName === 'openid' && item.value === 'user_no') {
						item.value = uni.getStorageSync('login_user_info').user_no;
					}
				})
				this.condition = this.params.condition;
			}
		} else if (query.serviceName && query.type) {
			this.serviceName = query.serviceName;
			this.type = query.type;
			if (option.hasOwnProperty('cond')) {
				try {
					this.condition = JSON.parse(decodeURIComponent(option.cond));
				} catch (e) {
					//TODO handle the exception
					console.log(e);
				}
			}
			this.getFieldsV2(this.condition);
		} else {
			uni.showToast({
				title: '加载错误',
				icon: 'none'
			});
		}
	},

	methods: {
		resetForm(e) {
			// 重置表单
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
			let colVs = await this.getServiceV2(this.serviceName, type ? type : this.type, type ? type : this.type, app);
			if (this.formDisabled) {
				colVs._fieldInfo.forEach(item => (item.disabled = true));
			}
			if (colVs.child_service && Array.isArray(colVs.child_service) && colVs.child_service.length > 0) {
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
					break;
				case 'detail':
					this.fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.defaultVal);
					break;
				default:
					break;
			}
		},
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
			if (!data) {
				uni.showToast({
					title: '未发现修改内容'
				});
				return;
			}
			let req = this.deepClone(data);
			console.log(this.condition);
			console.log(e, req);
			switch (e.button_type) {
				case 'edit':
					if (e.page_type === '详情') {
					} else {
						if (req) {
							req = [{ serviceName: e.service_name, data: [req], condition: this.condition }];
							let app = uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(app, e.service_name, 'add');
							this.onRequest('update', e.service_name, req).then(res => {
								console.log('res:' + e.service_name, res);
								if (res.data.state === 'SUCCESS') {
									let resData = this.getResData(res.data.response);
									console.log('resData', resData);
									uni.showModal({
										title: '提示',
										content: '修改成功',
										showCancel: false,
										success(res) {
											if (res.confirm) {
												uni.navigateBack();
											}
										}
									});
								}
							});
						}
					}
					break;
				case 'submit':
					console.log('addServiceName:', e.service_name);
					if (req) {
						Object.keys(req).forEach(item => {
							if (Array.isArray(req[item])) {
								req[item] = req[item].toString();
							}
						});
						req = [{ serviceName: e.service_name, data: [req] }];
						let app = uni.getStorageSync('activeApp');
						let url = this.getServiceUrl(app, e.service_name, 'add');
						console.log(url, e);
						let res = await this.$http.post(url, req);
						console.log(url, res.data);
						if (res.data.state === 'SUCCESS') {
							uni.showModal({
								title: '提示',
								content: '添加成功',
								showCancel: false,
								success(res) {
									if (res.confirm) {
										uni.navigateBack();
									}
								}
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
				case 'customize':
					if (e.application && e.operate_service) {
						const url = this.getServiceUrl(e.application, e.operate_service, 'operate');
						const req = [
							{
								data: [e.requestData],
								serviceName: e.operate_service,
								srvApp: e.application
							}
						];
						let res = await this.$http.post(url, req);
						if (res.data.state === 'SUCCESS') {
							uni.showModal({
								title: '提示',
								content: e.tip_msg ? e.tip_msg : res.data.resultMessage,
								showCancel: false,
								success(res) {
									if (res.confirm) {
										setTimeout(() => {
											uni.navigateBack();
										}, 2000);
									}
								}
							});
						} else {
							uni.showToast({
								title: res.data.resultMessage,
								mask: false,
								icon: 'none'
							});
						}
					}
					break;
				default:
					uni.showToast({
						title: e.button_name
					});
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
	background-color: #c4e5ff !important;
	.cu-item {
		opacity: 0;
		&.show {
			opacity: 1;
			transition: all 2s;
		}
	}
}
</style>
