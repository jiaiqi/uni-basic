<template>
	<view class="wrap">
		<u-form :model="formModel" ref="uForm" label-width="250" :label-style="labelStyle">
			<u-form-item label="商户名称" prop="scenic" :required="true"><u-input v-model="formModel.scenic" /></u-form-item>
			<u-form-item label="商家电话" prop="phone" :required="true"><u-input v-model="formModel.phone" /></u-form-item>
			<u-form-item label="营业执照号码" prop="licenseNum" :required="true"><u-input v-model="formModel.licenseNum" /></u-form-item>
			<u-form-item label="营业执照" :required="true" prop="business">
				<u-upload
					index="business"
					ref="uUpload"
					v-if="businfileList[0] && businfileList[0].url"
					@on-success="businUploadFileSuccess"
					@on-remove="removeFile"
					:form-data="formDatazz"
					:header="uploadHeader"
					:action="action"
					:file-list="businfileList"
					:auto-upload="true"
					max-count="3"
				></u-upload>
				<u-upload
					index="business"
					ref="uUpload"
					v-else
					@on-success="removeFile"
					@on-remove="removeFile"
					:form-data="formDatazz"
					:header="uploadHeader"
					:action="action"
					:file-list="businfileList"
					:auto-upload="true"
					max-count="3"
				></u-upload>
			</u-form-item>
			<u-form-item label="商户门头" :required="true" prop="store">
				<u-upload
					index="store"
					v-if="storefileList[0] && storefileList[0].url"
					ref="uUpload"
					@on-success="stoteUploadFileSuccess"
					@on-remove="removeFile"
					:form-data="formDatamt"
					:header="uploadHeader"
					:file-list="storefileList"
					:action="action"
					:auto-upload="true"
					max-count="3"
				></u-upload>
				<u-upload
					index="store"
					v-else
					ref="uUpload"
					@on-success="stoteUploadFileSuccess"
					@on-remove="removeFile"
					:form-data="formDatamt"
					:header="uploadHeader"
					:file-list="storefileList"
					:action="action"
					:auto-upload="true"
					max-count="3"
				></u-upload>
			</u-form-item>
			<view class="button-box"><view class="button" @click="submitForm">提交</view></view>
		</u-form>
	</view>
</template>

<script>
export default {
	data() {
		return {
			formModel: {
				scenic: '',
				phone: '',
				licenseNum: ''
			},
			formDatamt: {
				serviceName: 'srv_bxfile_service',
				interfaceName: 'update',
				thumbnailType: 'fwsu_100',
				app_no: 'spocp',
				file_no: '',
				table_name: '',
				columns: ''
			},
			formDatazz: {
				serviceName: 'srv_bxfile_service',
				interfaceName: 'update',
				thumbnailType: 'fwsu_100',
				app_no: 'spocp',
				file_no: '',
				table_name: '',
				columns: ''
			},
			uploadHeader: {
				bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
			},
			type: '',
			dadaItem: {},
			action: this.$api.upload,
			businfileList: [],
			storefileList: [],
			radioList: [
				{
					name: '管理员',
					disabled: false
				},
				{
					name: '审核人',
					disabled: false
				}
			],
			rules: {
				scenic: [
					{
						required: true,
						message: '请输入商户名称',
						trigger: ['change', 'blur']
					}
				],
				phone: [
					{
						required: true,
						message: '请输入商家电话',
						trigger: ['change', 'blur']
					}
				],
				licenseNum: [
					{
						required: true,
						message: '请输入执照号码',
						trigger: ['change', 'blur']
					}
				]
			},
			labelStyle: {
				paddingLeft: '50rpx',
				color: '#000'
			},
			queryInfo: {}
		};
	},
	async onLoad(option) {
		this.action = this.$api.upload;
		if (option && option.data) {
			const item = JSON.parse(decodeURIComponent(option.data));
			console.log(item);
			let self = this;
			this.queryInfo = this.deepClone(item);
			this.formModel.scenic = item.store_name;
			this.formModel.phone = item.store_tel;
			this.formModel.licenseNum = item.business_no;
			this.formDatazz.file_no = item.business_pic;
			this.formDatamt.file_no = item.store_pic;
			if (option.type) {
				this.type = option.type;
				let business_pic = null;
				let store_pic = null;
				let business_img = await self.getFilePath(item.business_pic);
				let store_img = await self.getFilePath(item.store_pic);
				this.businfileList = business_img.map(img => {
					return {
						url: this.$api.getFilePath + img.fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100'
					};
				});
				this.storefileList = store_img.map(img => {
					return {
						url: this.$api.getFilePath + img.fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100'
					};
				});
			} else {
				if (item.businessImgList.length > 0) {
					this.businfileList = item.businessImgList.map(img => {
						return {
							url: img
						};
					});
				} else {
					if (item.business_no) {
						this.businfileList.push({ url: item.businessImg });
					}
				}
				if (item.storeImgList.length > 0) {
					this.storefileList = item.storeImgList.map(img => {
						return {
							url: img
						};
					});
				} else {
					if (item.store_no) {
						this.storefileList.push({ url: item.storeImg });
					}
				}
			}
			console.log(item);
		}
	},
	methods: {
		removeFile(index, lists, name) {
			let file_no = '';
			let deletedImagePath = '';
			let imageIndex = index;
			if (name === 'business') {
				file_no = this.formDatazz.file_no;
				deletedImagePath = this.businfileList[imageIndex].url;
				this.businfileList.splice(imageIndex, 1);
			} else if (name === 'store') {
				file_no = this.formDatamt.file_no;
				deletedImagePath = this.storefileList[imageIndex].url;
				this.storefileList.splice(imageIndex, 1);
			}
			let fileUrl = deletedImagePath.substring(deletedImagePath.lastIndexOf('filePath=') + 9, deletedImagePath.length);
			if (fileUrl.lastIndexOf('&thumbnailType=fwsu_100') !== -1) {
				fileUrl = fileUrl.substring(0, fileUrl.lastIndexOf('&thumbnailType=fwsu_100'));
			}
			if (fileUrl.lastIndexOf('&bx_auth_ticket=') !== -1) {
				fileUrl = fileUrl.substring(0, fileUrl.lastIndexOf('&bx_auth_ticket='));
			}
			if (this.$api.deleteFile) {
				uni.request({
					url: this.$api.deleteFile,
					method: 'POST',
					header: {
						bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
					},
					data: {
						fileurl: fileUrl
					},
					success: res => {
						console.log(res.data);
						uni.showToast({
							title: '删除成功',
							icon: 'none'
						});
					}
				});
			}
		},
		submitForm() {
			this.$refs.uForm.validate(valid => {
				valid && this.getStaffList();
			});
		},
		businUploadFileSuccess(e) {
			// 图片上传成功
			console.log(e.file_no, '********');
			this.formDatazz.file_no = e.file_no;
			try {
				console.log(this.queryInfo.business_pic);
				this.queryInfo.business_pic = e.file_no;
				console.log('successimg1', this.queryInfo.business_pic);
			} catch (e) {
				//TODO handle the exception
				console.log(e);
			}
		},
		stoteUploadFileSuccess(e) {
			// 图片上传成功
			console.log(e.file_no);
			this.formDatamt.file_no = e.file_no;
			try {
				this.queryInfo.store_pic = e.file_no;
				console.log('successimg2');
			} catch (e) {
				//TODO handle the exception
				console.log(e);
			}
		},
		async getStaffList() {
			let serviceName = 'srvspocp_merchant_update_store';
			if (!this.type) {
				// 商户/商户员工修改商户信息
				serviceName = 'srvspocp_update_store';
			}
			let url = this.getServiceUrl('spocp', serviceName, 'update');
			// let url = this.getServiceUrl('spocp', 'srvspocp_store_update', 'operate');
			let req = [
				{
					serviceName: serviceName,
					// serviceName: 'srvspocp_store_update',
					condition: [
						{
							colName: 'merchant_no',
							ruleType: 'eq',
							value: this.queryInfo.merchant_no
						},
						{
							colName: 'store_no',
							ruleType: 'eq',
							value: this.queryInfo.store_no
						}
					],
					data: [
						{
							//   "store_name":"测试商户001商场",
							//                 "store_tel":"01056238956",
							//                 "business_no":"Gh464649494",
							//                 "business_pic":"20200910095244520100",
							//                 "store_pic":"20200910095253063100"
							business_no: this.formModel.licenseNum,
							business_pic: this.queryInfo.business_pic,
							// merchant_no: this.queryInfo.merchant_no,
							store_name: this.formModel.scenic,
							store_pic: this.queryInfo.store_pic,
							store_tel: this.formModel.phone
						}
					]
				}
			];
			if (!this.type) {
				req[0].data[0]['audit_status'] = '待审核';
				req[0].condition = [
					{
						colName: 'store_no',
						ruleType: 'eq',
						value: this.queryInfo.store_no
					}
				];
			}
			let res = await this.$http.post(url, req);
			console.log(res);
			if (res.data.state === 'SUCCESS') {
				uni.showToast({
					title: '提交成功',
					icon: 'success',
					duration: 500,
					complete() {
						uni.navigateBack({});
						// uni.redirectTo({
						// 	url: '../merchant/merchant'
						// });
					}
				});
			} else {
				uni.showToast({
					title: res.data.resultMessage,
					icon: 'none'
				});
			}
		}
	},
	onReady() {
		this.$refs.uForm.setRules(this.rules);
	}
};
</script>

<style lang="scss" scoped>
.wrap {
	width: 100vw;
	height: 100vh;
	// background-color: #f4f6fa;
	// background-image: url(../../../static/img/regbg@2x.png);
	background-position: bottom;
	background-size: 100% 22%;
	background-repeat: no-repeat;
}

.u-form {
	background-color: #fff;
	padding-left: 30rpx;
}

.button-box {
	display: flex;
	padding: 80rpx 0;
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
</style>
