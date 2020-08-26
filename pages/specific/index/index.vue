<template>
	<view class="index-wrap" v-loading="loading">
		<u-button type="primary" shape="circle" :ripple="true" @click="toPage('person')">我的二维码</u-button>
		<!-- <u-button type="success" shape="circle" :ripple="true" @click="toPage('get')">优惠券</u-button> -->
		<!-- <u-button type="warning" shape="circle" :ripple="true" v-if="showMerchantList" @click="toPage('list')">商户管理</u-button> -->
		<u-button type="success" shape="circle" :ripple="true" v-if="showMerchantList" @click="toScan()">商家扫码</u-button>
		<u-button type="warning" shape="circle" :ripple="true" v-if="showMerchantList" @click="toPage('list')">店员管理</u-button>
		<!-- <u-button type="warning" shape="circle" :ripple="true" v-if="showMerchantList" @click="toPage('list')">扫码记录</u-button> -->
		<u-button type="warning" shape="circle" :ripple="true" v-if="!showMerchantList" @click="toMerchant()">商家登记</u-button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			showMerchantList: false,
			isValid: false, //是否有效商户
			loading: false
		};
	},
	onLoad() {
		// const loading = this.$loading({
		// 	lock: true,
		// 	text: '加载中',
		// 	background: 'rgba(0, 0, 0, 0.7)'
		// });
		// this.loading = true;
		setTimeout(() => {
			// loading.close();
			// this.loading = false
		}, 5000);
		this.selectRealNameInfo().then(res => {
			// 查询实名信息
			if (res && res.data && res.status === 'success') {
				// 有商户数据并且商户数据有值
				if (res._merchant_user && typeof res._merchant_user === 'object' && Object.keys(res._merchant_user).length > 0) {
					this.showMerchantList = true;
					if (res._merchant_user.status === '已确认') {
						this.isValid = true;
					}
					this.getSignature();
				}
			}
		});
	},
	methods: {
		toPage(e) {
			let url = '';
			switch (e) {
				case 'person':
					url = '/pages/specific/qrCode/qrCode';
					break;
				case 'get':
					url = '/pages/specific/couponList/couponList';
					break;
				case 'list':
					if (!this.isValid) {
						uni.showModal({
							title: '提示',
							content: '当前商户非有效商户,请联系管理员确认商户信息',
							showCancel: false,
							confirmText: '知道了'
						});
					}
					url = '/pages/specific/merchantList/merchantList';
					break;
			}
			if (url) {
				uni.navigateTo({
					url: url
				});
			}
		},
		toMerchant() {
			uni.navigateTo({
				url: '/pages/specific/merchantReg/merchantReg'
			});
		},
		/*注入接口权限**/
		getSignature(formData) {
			let self = this;
			let linkurl = window.location.href.split('#')[0];
			let req = {
				serviceName: 'srvwx_app_signature_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'app_no',
						ruleType: 'eq',
						value: this.$api.appNo.wxh5
					},
					{
						colName: 'page_url',
						ruleType: 'eq',
						value: linkurl
						// value: uni.getStorageSync('linkUrl') ? uni.getStorageSync('linkUrl') : window.location.href.split('#')[0]
					}
				]
			};
			self.$http.post(self.$api.getSignature, req).then(res => {
				if (res.data.state === 'SUCCESS') {
					let resData = res.data.data[0];
					console.log('getSignature', resData);
					jweixin.config({
						debug: false, // 调试阶段建议开启
						appId: resData.appId, // APPID
						timestamp: resData.timestamp, // 时间戳timestamp
						nonceStr: resData.noncestr, // 随机数nonceStr
						signature: resData.signature, // 签名signature
						// 需要调用的方法接口
						jsApiList: ['scanQRCode']
					});
					jweixin.ready(() => {});
					jweixin.error(function(res) {
						// alert(JSON.stringify(res));
						console.log(res);
					});
				} else {
				}
			});
		},
		/* 调取微信扫码并返回扫码结果**/
		toScan() {
			if (!this.isValid) {
				uni.showModal({
					title: '提示',
					content: '当前商户非有效商户,请联系管理员确认商户信息',
					showCancel: false,
					confirmText: '知道了'
				});
				return;
			}
			console.log('0000000');
			jweixin.ready(function() {
				jweixin.checkJsApi({
					jsApiList: ['scanQRCode'],
					success: function(res) {
						console.warn('---------------打开扫一扫---------------', res);
						jweixin.scanQRCode({
							needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
							scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
							success: function(res) {
								var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
								uni.navigateTo({
									url: '/pages/specific/qrcodeDetail/qrcodeDetail?qrcodeInfo=' + result
								});
								console.log('扫描二维码结果====', result);
							},
							error(e) {
								console.error(e);
							}
						});
					},
					error(e) {
						console.error('checkJsApi失败', e);
					}
				});
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.index-wrap {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-top: 30vh;
	background-image: url(../../../static/img/bgs.jpeg);
	background-size: cover;
	z-index: 2000;
	// justify-content: center;
	.u-btn {
		min-width: 60vw;
		margin-top: 50rpx;
	}
}
</style>
