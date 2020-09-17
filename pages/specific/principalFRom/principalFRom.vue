<template>
	<view class="wrap">
		<u-form :model="formModel" ref="uForm" label-width="250" :label-style="labelStyle">
			<u-form-item label="姓名" prop="name" :required="true"><u-input v-model="formModel.name" :placeholder="`请输入姓名`" /></u-form-item>
			<u-form-item label="证件号码" prop="id_card" :required="true"><u-input v-model="formModel.id_card" :placeholder="`请输入证件号码`" /></u-form-item>
			<u-form-item label="身份" :required="true" prop="radio" v-if="isMerchant">
				<u-radio-group v-model="formModel.radio">
					<u-radio v-for="(item, index) in radioList" :key="index" :name="item.name" :disabled="item.disabled">{{ item.name }}</u-radio>
				</u-radio-group>
			</u-form-item>
		</u-form>
		<view class="button-box"><view class="button" @click="submitForm">提交</view></view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			formModel: {
				name: '',
				id_card: '',
				radio: ''
			},
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
				name: [
					{
						required: true,
						message: '请输入姓名',
						trigger: ['change', 'blur']
					}
				],
				id_card: [
					{
						required: true,
						message: '请输入证件号码',
						trigger: ['change', 'blur']
					}
				],
				radio: [
					{
						required: true,
						message: '请选择身份',
						trigger: ['change', 'blur']
					}
				]
			},
			labelStyle: {
				paddingLeft: '50rpx',
				color: '#000'
			},
			mer_no: '',
			isMerchant: true,
			svrName: 'srvspocp_merchant_principal_add'
		};
	},
	onLoad(option) {
		this.mer_no = option.no;
		// merchant//商户 store商家 status   mer_no 商户编号
		if (option.status == 'store') {
			this.isMerchant = false;
			this.svrName = 'srvspocp_store_users_add';
			uni.setNavigationBarTitle({
				title: '员工增加'
			});
		} else {
			uni.setNavigationBarTitle({
				title: '负责人增加'
			});
		}
		// console.log()
	},
	methods: {
		async submitData(mer_no) {
			let url = this.getServiceUrl('spocp', this.svrName, 'operate');
			let realNameInfo = uni.getStorageSync('realNameInfo');
			let req = [
				{
					serviceName: this.svrName,
					condition: [],
					data: []
				}
			];
			console.log('this.isMerchant', this.isMerchant);
			if (this.isMerchant) {
				req[0].data = [
					{
						id_card_no: this.formModel.id_card,
						identity: this.formModel.radio,
						merchant_no: this.mer_no ? this.mer_no : realNameInfo.user._merchant_user[0].merchant_no,
						real_name: this.formModel.name
					}
				];
			} else {
				req[0].data = [
					{
						id_card_no: this.formModel.id_card,
						real_name: this.formModel.name,
						is_manager: '否',
						store_no: this.mer_no ? this.mer_no : realNameInfo.user._store_user[0].store_no
					}
				];
			}
			let res = await this.$http.post(url, req);
			if (res.data.state == 'SUCCESS' && res.data.response.length > 0) {
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				});
				uni.showLoading({
					title: '跳转中...'
				});
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					});
				}, 500);
			} else {
				uni.showToast({
					title: '提交失败，请重试'
				});
			}
		},
		submitForm() {
			this.$refs.uForm.validate(valid => {
				valid && this.submitData(this.mer_no);
			});
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
	background-color: #f4f6fa;
	background-image: url(../../../static/img/regbg@2x.png);
	background-position: bottom;
	background-size: 100%;
	background-repeat: no-repeat;
	.u-form {
		background-color: #fff;
		padding-left: 30rpx;
	}
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
