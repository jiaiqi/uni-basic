<template>
	<view class="reg-main">
		<u-form :model="formModel" ref="uForm" label-width="200" :label-style="labelStyle">
			<!-- <u-form-item label="压缩图片测试"><u-image width="200rpx" height="200rpx" :src="compressBaseString"></u-image></u-form-item> -->
			<u-form-item label="证件照片" :required="true" prop="id_card_photo">
				<u-upload
					:action="action"
					:max-count="1"
					:header="uploadHeader"
					:form-data="formData"
					:file-list="fileList"
					:compress-file="compressFile"
					:placeholder="`请上传证件照片(必传)`"
					:before-upload="beforeUpload"
					@on-success="uploadFileSuccess"
					@on-list-change="onListChange"
					@on-remove="removePic"
					:show-upload-list="true"
					ref="uUpload"
				></u-upload>
			</u-form-item>
			<u-form-item label="姓名" prop="name" :required="true"><u-input v-model="formModel.name" :placeholder="`请输入姓名`" /></u-form-item>
			<u-form-item label="性别" :required="true" prop="sex">
				<radio-group @change="radioChange">
					<label v-for="(item, index) in sexList" :key="index">
						<radio class="margin-right-xs" :value="item.value" :checked="formModel.sex === item.value" />
						<text class="margin-right">{{ item.value }}</text>
					</label>
				</radio-group>
			</u-form-item>
			<u-form-item label="出生日期" :required="true" prop="date_of_birth">
				<u-input disabled :border="border" placeholder="请选择出生日期" v-model="formModel.date_of_birth" type="text" @click="showTimePicker = true"></u-input>
				<u-picker default-time="1990-01-01" v-model="showTimePicker" mode="time" @confirm="confirmDate"></u-picker>
			</u-form-item>
			<u-form-item label="地址" :required="true" prop="address"><u-input v-model="formModel.address" :placeholder="`请输入地址`" /></u-form-item>
			<u-form-item label="证件号码" prop="id_card" :required="true"><u-input v-model="formModel.id_card" :placeholder="`请输入证件号码`" /></u-form-item>
			<u-form-item label="手机号码" prop="mobile" :required="true"><u-input v-model="formModel.mobile" :placeholder="`请输入手机号码`" /></u-form-item>
			<u-form-item :label-position="labelPosition" :required="true" label="图形验证码" prop="imageCode" label-width="200">
				<u-input :border="border" placeholder="请输入图形验证码" v-model="imageCode" type="text" maxlength="4" @blur="validateImageCode" @confirm="validateImageCode"></u-input>
				<image :src="codeImageString" mode="" class="code-image" @click="getImageCode"></image>
			</u-form-item>
			<u-form-item :label-position="labelPosition" :required="true" label="验证码" prop="mobileCode" label-width="200">
				<u-input :border="border" placeholder="请输入验证码" v-model="mobileCode" type="text"></u-input>
				<u-button slot="right" size="mini" @click="getCode" class="code-btn">{{ codeTips }}</u-button>
			</u-form-item>
			<u-verification-code seconds="60" ref="uCode" :keep-running="true" @change="codeChange"></u-verification-code>
		</u-form>
		<view class="button-box"><view class="button" @click="submitForm">提交</view></view>
		<uni-popup type="bottom" ref="ocrPopup" :maskClick="false">
			<view class="ocr-info">
				<view class="title">识别到您的身份证信息如下:</view>
				<u-form :model="ocrInfo" ref="uForm2" label-width="150">
					<u-form-item label="姓名"><u-input v-model="ocrInfo.name" /></u-form-item>
					<u-form-item label="性别">
						<radio-group @change="radioChange">
							<label v-for="(item, index) in sexList" :key="index">
								<radio class="margin-right-xs" :value="item.value" :checked="ocrInfo.sex === item.value" />
								<text class="margin-right">{{ item.value }}</text>
							</label>
						</radio-group>
					</u-form-item>
					<u-form-item label="出生日期"><u-input @click="showDatePicker = true" disabled v-model="ocrInfo.birth" /></u-form-item>
					<u-picker mode="time" v-model="showDatePicker" :params="datePickerParams" @confirm="confirmDate($event, 'ocrInfo')" default-time="1992-01-01"></u-picker>
					<u-form-item label="身份证号"><u-input v-model="ocrInfo.idNo" /></u-form-item>
					<u-form-item label="住址"><u-input v-model="ocrInfo.address" /></u-form-item>
				</u-form>
				<view class="warn-text">请检查信息是否正确，点击确定按钮将使用以上信息覆盖已填写内容</view>
				<view class="button-box"><button class="button cu-btn bg-blue" type="primary" @click="coverageInfo(true)">确定</button></view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import getCompressImage from '@/common/js/function/compressImage.js';
export default {
	data() {
		return {
			ocrInfo: {},
			formModel: {
				auth_user_no: '',
				name: '',
				id_card: '',
				id_card_photo: '',
				mobile: '',
				date_of_birth: '',
				sex: '',
				address: ''
			},
			showDatePicker: false,
			datePickerParams: {
				year: true,
				month: true,
				day: true,
				hour: false,
				minute: false,
				second: false
			},
			showTimePicker: false,
			sexList: [
				{
					label: '男',
					value: '男'
				},
				{
					label: '女',
					value: '女'
				}
			],
			rules: {
				id_card_photo: [
					{
						required: true,
						message: '请上传身份证照片',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				],
				name: [
					{
						required: true,
						message: '请输入姓名',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				],
				date_of_birth: [
					{
						required: true,
						message: '请选择出生日期',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				],
				sex: [
					{
						required: true,
						message: '请选择性别',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				],
				address: [
					{
						required: true,
						message: '请选择性别',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				],
				id_card: [
					{
						required: true,
						message: '请输入证件号码',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				],
				mobile: [
					{
						required: true,
						message: '请输入手机号码',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					},
					{
						validator: (rule, value, callback) => {
							// 上面有说，返回true表示校验通过，返回false表示不通过
							// this.$u.test.mobile()就是返回true或者false的
							return Number.isNaN(Number(value)) !== true && value.length === 11;
						},
						message: '请检查手机号格式是否正确',
						// 可以单个或者同时写两个触发验证方式
						trigger: ['change', 'blur']
					}
				]
			},
			imageCode: '',
			mobileCode: '',
			border: false,
			codeImage: '',
			codeImageString: '',
			codeTips: '获取验证码',
			formData: {
				serviceName: 'srv_bxfile_service',
				interfaceName: 'add',
				app_no: 'spocp',
				table_name: 'bxspocp_user_auth_info',
				columns: 'id_card_photo'
				// thumbnailType: 'fwsu_100'
			},
			uploadHeader: {
				bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
			},
			showUploadList: false,
			action: '',
			fileList: [],
			compressFile: {}, //压缩后的File对象
			compressBaseString: '',
			compressList: {},
			lists: [],
			labelPosition: 'left',
			labelStyle: {
				paddingLeft: '50rpx',
				color: '#000'
			},
			serviceName: 'srvspocp_user_real_name_auth',
			loadingInstance: null
		};
	},

	methods: {
		removePic(e) {
			this.formModel.id_card_photo = null;
		},
		confirmDate(e, type) {
			console.log(e);
			if (e.month && e.year && e.day) {
				if (type === 'ocrInfo') {
					this.ocrInfo.birth = `${e.year}-${e.month}-${e.day}`;
				} else {
					this.formModel.date_of_birth = `${e.year}-${e.month}-${e.day}`;
				}
			}
		},
		async submitForm() {
			let self = this;
			let formModel = this.deepClone(this.formModel);
			let valid = await self.$refs.uForm.validate();
			// (valid => {
			if (valid) {
				if (!this.imageCode) {
					this.$u.toast('请输入图形验证码');
					return;
				}
				if (!this.mobileCode) {
					this.$u.toast('请输入手机验证码');
					return;
				}
				if (!this.formModel.id_card_photo) {
					this.$u.toast('请上传身份证照片');
					return;
				}
				let req = [
					{
						serviceName: 'srvspocp_user_real_name_auth',
						condition: [
							{
								colName: 'mobile', //手机号
								ruleType: 'eq',
								value: formModel.mobile
							},
							{
								colName: 'mobileCode', //验证码
								ruleType: 'eq',
								value: this.mobileCode
							}
						],
						data: [formModel]
					}
				];
				let url = this.getServiceUrl('spocp', 'srvspocp_user_real_name_auth', 'operate');
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					await this.selectRealNameInfo();
					self.currentDialog = self.$dialog({
						content: '登记成功,即将返回首页',
						buttons: [
							{
								name: '好的', //按钮名称
								behavior: 'navTo', //按钮动作
								targetPage: self.$api.homePath
							}
						]
					});
				} else {
					uni.showToast({
						title: res.data.resultMessage,
						icon: 'none'
					});
				}
			} else {
				console.log('验证失败');
			}
			// });
		},
		radioChange(e, type) {
			let value = e;
			value = e.detail.value;
			if (type && type === 'ocrInfo') {
				this.ocrInfo.sex = value;
				this.$set(this.ocrInfo, 'sex', value);
			} else {
				this.formModel.sex = value;
				this.$set(this.formModel, 'sex', value);
			}
		},
		deleteItem(index) {
			this.$refs.uUpload.remove(index);
		},
		async beforeUpload(index, list) {
			let self = this;
			console.time('compress-time');
			let res = await getCompressImage(list[0].file, 0.1, 0.1);
			console.timeEnd('compress-time');
			this.compressBaseString = res.base64;
			console.log('压缩图片信息：', res);
			this.compressFile = res.file;
			this.loadingInstance = this.$loading({
				lock: true,
				text: '正在上传', //提示文字
				fullscreen: false, // 是否全屏背景
				loadingMode: 'flower', //加载样式 circle-圆环 flower-...
				size: '90', //加载的图标的大小 fontsize
				textColor: '#fff' //提示文字的color
				// color:"#009688" // mode为circle时 可以设置圆环颜色
				// background: 'rgba(0, 0, 0, 0.7)' //遮罩的背景颜色
			});
			return true;
		},
		uploadFileSuccess(e) {
			// 图片上传成功
			console.log(e);
			try {
				this.loadingInstance.close();
			} catch (e) {
				//TODO handle the exception
				console.log(e);
			}
			if (e.file_no) {
				this.formModel.id_card_photo = e.file_no;
				this.loadingInstance = this.$loading({
					lock: true,
					text: '正在识别', //提示文字
					fullscreen: false, // 是否全屏背景
					loadingMode: 'flower', //加载样式 circle-圆环 flower-...
					size: '90', //加载的图标的大小 fontsize
					textColor: '#fff' //提示文字的color
					// color:"#009688" // mode为circle时 可以设置圆环颜色
					// background: 'rgba(0, 0, 0, 0.7)' //遮罩的背景颜色
				});
				this.toOCR(e.file_no);
			} else {
				alert('上传失败');
			}
		},
		onListChange(e) {
			this.lists = e;
		},
		async toOCR(file_no) {
			// ocr识别身份证信息
			let self = this;
			const reqUrl = self.getServiceUrl('daq', 'srvdaq_orc_idcard_extraction', 'operate');
			const reqData = [
				{
					serviceName: 'srvdaq_orc_idcard_extraction',
					data: [
						{
							file_no: file_no
						}
					]
				}
			];
			let response = await self.$http.post(reqUrl, reqData, 'test');
			// 得到识别的文字
			try {
				this.loadingInstance.close();
			} catch (e) {
				//TODO handle the exception
				console.log(e);
			}
			if (response.data.state === 'SUCCESS') {
				const resp = response.data.response[0].response;
				this.getOcrInfo(resp);
			} else {
				console.log(response.data.resultMessage);
			}
			// uni.hideLoading()
		},
		getOcrInfo(e) {
			// 拿到ocr接口返回的数据
			if (e) {
				let date = '';
				if (e.birth) {
					date = e.birth;
					date = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6);
				}
				let ocrInfo = {
					name: e.name,
					sex: e.sex,
					idNo: e.idcard,
					address: e.address,
					birth: date
				};
				if (!e.idcard || !e.name) {
					// 识别失败
					uni.showToast({
						title: '识别失败,请您上传正确的证件照片',
						icon: 'none'
					});
					this.$refs.uUpload.clear();
				} else {
					this.ocrInfo = ocrInfo;
					this.$refs.ocrPopup.open();
				}
			}
		},
		hideOcrPopup() {
			// 隐藏ocr弹出框
			this.$refs.ocrPopup.close();
		},
		coverageInfo(dontHide) {
			// 使用ocr识别出的信息覆盖已填写信息
			Object.keys(this.formModel).forEach(key => {
				switch (key) {
					case 'name':
						this.formModel.name = this.ocrInfo.name;
						break;
					case 'id_card':
						this.formModel.id_card = this.ocrInfo.idNo;
						break;
					case 'date_of_birth':
						this.formModel.date_of_birth = this.ocrInfo.birth;
						break;
					case 'sex':
						this.formModel.sex = this.ocrInfo.sex;
						break;
					case 'address':
						this.formModel.address = this.ocrInfo.address;
						break;
				}
				this.$refs.uForm.validate();
			});
			if (dontHide === true) {
				this.hideOcrPopup();
			}
		},
		codeChange(text) {
			this.codeTips = text;
		},

		getCode() {
			//获取验证码
			if (!this.formModel.mobile) {
				uni.showToast({
					title: '请先填写手机号',
					icon: 'none'
				});
				return;
			} else {
				let isMobile = this.$u.test.mobile(this.formModel.mobile);
				if (!isMobile) {
					this.$u.toast('手机号格式有误,请检查并重新输入');
					return;
				}
			}
			if (!this.imageCode) {
				uni.showToast({
					title: '请先填写图片验证码',
					icon: 'none'
				});
				return;
			}
			if (this.$refs.uCode.canGetCode) {
				// 模拟向后端请求验证码
				uni.showLoading({
					title: '正在获取验证码',
					mask: true
				});
				this.getMobileCode();
			} else {
				this.$u.toast('请等待倒计时结束后再发送');
			}
		},
		async getImageCode() {
			let req = [
				{
					serviceName: 'srvsso_matching_image_code',
					colNames: ['*']
				}
			];
			let url = this.getServiceUrl('sso', 'srvsso_matching_image_code', 'operate');
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.response && Array.isArray(res.data.response) && res.data.response.length > 0) {
				let data = res.data.response[0];
				if (data.response && data.response.base64String) {
					this.codeImageString = data.response.base64String;
				}
			}
		},
		async validateImageCode() {
			if (!this.imageCode) {
				uni.showToast({
					title: '请输入图形验证码',
					icon: 'none'
				});
				return;
			} else {
				if (this.imageCode.length < 4) {
					return;
				}
			}
			let req = [
				{
					serviceName: 'srvsso_matching_image_code_check',
					colNames: ['*'],
					data: [
						{
							imageCode: this.imageCode
						}
					]
				}
			];
			let url = this.getServiceUrl('sso', 'srvsso_matching_image_code_check', 'operate');
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.response && Array.isArray(res.data.response) && res.data.response.length > 0) {
				let data = res.data.response[0];
				if (data.response && data.response.check_state && data.response.check_state === 'SUCCESS') {
					return true;
				} else {
					this.$u.toast('图形验证码输入有误，请重新输入');
					return false;
				}
			} else {
				this.$u.toast('图形验证码输入有误，请重新输入');
				return false;
			}
		},
		async getMobileCode() {
			uni.hideLoading();
			let isValidate = await this.validateImageCode();
			if (!isValidate) {
				this.$u.toast('图形验证码输入有误，请重新输入');
				return;
			}
			if (!this.formModel.mobile) {
				this.$u.toast('请先输入手机号码');
				return;
			}
			let req = [
				{
					serviceName: 'srvsso_matching_send_node',
					colNames: ['*'],
					data: [
						{
							business_type: 'ZHBT_YMT_SMRZ', //业务类型
							mobile: this.formModel.mobile
						}
					]
				}
			];
			// 这里此提示会被this.start()方法中的提示覆盖
			this.$u.toast('验证码已发送');
			// 通知验证码组件内部开始倒计时
			this.$refs.uCode.start();
			let url = this.getServiceUrl('sso', 'srvsso_matching_send_node', 'operate');
			let res = await this.$http.post(url, req);
			await this.getImageCode();
			if (res.data.state === 'SUCCESS' && res.data.response && Array.isArray(res.data.response) && res.data.response.length > 0) {
				let data = res.data.response[0];
				if (data.response && data.response.check_state && data.response.check_state === 'SUCCESS') {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		// 预览图片
		doPreviewImage(url, index) {
			const images = this.lists.map(item => item.url || item.path);
			uni.previewImage({
				urls: images,
				current: url,
				success: () => {},
				fail: () => {
					uni.showToast({
						title: '预览图片失败',
						icon: 'none'
					});
				}
			});
		}
	},
	created() {
		this.action = this.$api.upload;
		this.getImageCode();
	},
	// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
	onReady() {
		this.$refs.uForm.setRules(this.rules);
	},
	onLoad() {
		let login_user_info = uni.getStorageSync('login_user_info');
		if (login_user_info) {
			this.formModel.auth_user_no = login_user_info.user_no;
		}
		uni.setStorageSync('activeApp', 'spocp');
		this.serviceName = 'srvspocp_user_real_name_auth';
		this.type = 'add';
		let self = this;
		this.selectRealNameInfo(null, true).then(res => {
			if (res && res.status == 'success') {
				self.currentDialog = self.$dialog({
					content: '已经实名认证,即将跳转到我的二维码页面',
					buttons: [
						{
							name: '好的', //按钮名称
							behavior: 'navTo', //按钮动作
							targetPage: self.$api.homePath
						}
						// {
						// 	name: '取消', //按钮名称
						// 	behavior: 'navTo', //按钮动作
						// 	targetPage: '/pages/specific/qrCode/qrCode'
						// }
					]
				});
				// uni.showModal({
				// 	title: '提示',
				// 	content: '已经实名认证,即将跳转到首页',
				// 	showCancel: false,
				// 	success(res) {
				// 		if (res.confirm) {
				// 			uni.reLaunch({
				// 				url: self.$api.homePath,
				// 				fail(res) {
				// 					if (res.errMsg) {
				// 						if (res.errMsg.indexOf('is not fond') !== -1 || self.$api.homePath.indexOf('http') !== -1) {
				// 							window.location.href = self.$api.homePath;
				// 						}
				// 					}
				// 				}
				// 			});
				// 		}
				// 	}
				// });
			} else {
				// 未实名认证 准备实名认证表单
			}
		});
	}
};
</script>

<style lang="scss" scoped>
.reg-main {
	// regbg@2x.png
	width: 100vw;
	height: 100vh;
	background-color: #fff;
	// background-color: #f4f6fa;
	// background-image: url(../../../static/img/regbg@2x.png);
	background-position: bottom;
	background-size: 100%;
	background-repeat: no-repeat;
	.u-form {
		background-color: #fff;
		padding-left: 30rpx;
		.code-image {
			width: 200rpx;
			height: 80rpx;
			border: 1px dashed #f1f1f1;
			margin-right: 20rpx;
		}
		.code-btn {
			margin-right: 20rpx;
			background-color: rgb(54, 119, 238);
			color: #fff;
		}
		.pre-box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-wrap: wrap;
			width: 100rpx;
			height: 100rpx;
		}
		// .pre-item {
		// 	height: 140rpx;
		// 	width: 100%;
		// 	border-radius: 10rpx;
		// 	overflow: hidden;
		// 	position: relative;
		// 	margin-bottom: 20rpx;
		// }
		// /deep/ .slot-btn {
		// 	width: 329rpx;
		// 	height: 140rpx;
		// 	display: flex;
		// 	justify-content: center;
		// 	align-items: center;
		// 	background: rgb(244, 245, 246);
		// 	border-radius: 10rpx;
		// }
		// .u-progress {
		// 	position: absolute;
		// 	bottom: 10rpx;
		// 	left: 8rpx;
		// 	right: 8rpx;
		// 	z-index: 9;
		// 	width: auto;
		// }
		// // .pre-item-image {
		// // 	width: 100%;
		// // 	height: 140rpx;
		// // }
		// // .u-delete-icon {
		// // 	position: absolute;
		// // 	top: 10rpx;
		// // 	right: 10rpx;
		// // 	z-index: 10;
		// // 	background-color: $u-type-error;
		// // 	border-radius: 100rpx;
		// // 	width: 44rpx;
		// // 	height: 44rpx;
		// // 	display: flex;
		// // 	align-items: center;
		// // 	justify-content: center;
		// // }
	}
	.button-box {
		display: flex;
		padding: 40rpx 0;
		width: 80%;
		margin: 0 auto;
		justify-content: space-around;
		.button {
			padding: 10rpx 50rpx;
			border-radius: 50rpx;
			flex: 1;
			max-width: 70%;
			text-align: center;
			background: linear-gradient(to right, rgb(54, 119, 238) 0%, rgba(54, 119, 238, 0.9) 70%, rgba(54, 119, 238, 0.7) 100%);
			color: #fff;
			&:active {
				transform: translateY(2px) translateX(1px);
			}
		}
	}
}

.ocr-info {
	background-color: #fff;
	padding: 20rpx;
	.u-form {
		padding-left: 0;
	}
	.title {
		padding: 20rpx 0;
		font-weight: bold;
	}
	.warn-text {
		padding: 20rpx 0 50rpx;
	}
	.button-box {
		display: flex;
		// justify-content: space-between;
		justify-content: center;
		.button {
			width: calc(50% - 10rpx);
		}
	}
}
</style>
