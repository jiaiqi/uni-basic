<template>
	<view class="menu-wrap">
		<view class="shop-info" v-if="merchantInfo">
			<view class="shop-name">{{ merchantInfo.store_name }}</view>
			<view class="info-item">
				<view class="label">联系电话：</view>
				<view class="value">{{ merchantInfo.store_tel }}</view>
			</view>
		</view>
		<view class="menu-box">
			<view class="menu-item" v-if="isMerchant || isEmployee" @click="toPage('detail')">
				<text class="icon cuIcon-shop margin-right-xs"></text>
				<view class="cont">
					<text>商户信息</text>
					<text class="tip">查看商户详情信息</text>
				</view>
				<text class="icon cuIcon-right right"></text>
			</view>
			<view class="menu-item" v-if="isMerchant" @click="toPage('people')">
				<text class="icon cuIcon-people margin-right-xs"></text>
				<view class="cont">
					<text>员工管理</text>
					<text class="tip">查看员工信息，添加、删除员工数据</text>
				</view>
				<text class="icon cuIcon-right right"></text>
			</view>
			<view class="menu-item" v-if="isMerchant || isEmployee" @click="toPage('scan')">
				<text class="icon cuIcon-scan margin-right-xs"></text>
				<view class="cont">
					<text>扫码核销</text>
					<text class="tip">扫描用户出示的优惠券二维码</text>
				</view>
				<text class="icon cuIcon-right right"></text>
			</view>
			<view class="menu-item" v-if="isMerchant || isEmployee" @click="toPage('used')">
				<text class="icon cuIcon-ticket margin-right-xs"></text>
				<view class="cont">
					<text>核销记录</text>
					<text class="tip">查看当前商户已核销的优惠券</text>
				</view>
				<text class="icon cuIcon-right right"></text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isMerchant: false, //是否是商家
			isEmployee: false, //是否是员工
			realNameInfo: '',
			merchantInfo: '',
			employeeInfo:''
		};
	},
	methods: {
		toPage(e) {
			let url = '';
			switch (e) {
				case 'reg':
					url = '/pages/specific/merchantReg/merchantReg';
					break;
				case 'detail':
					let params = {
						type: 'detail',
						condition: [
							{
								colName: 'store_no',
								ruleType: 'in',
								value: this.merchantInfo.store_no
							}
						],
						serviceName: 'srvspocp_store_select'
					};
					uni.navigateTo({
						url: '/pages/public/normal/formPage/formPage?params=' + JSON.stringify(params)+'&destApp=spocp'
					});
					// url = '/pages/specific/merchantDetail/merchantDetail';
					break;
				case 'people':
					// url = '/pages/specific/merchantList/merchantList';
					url = '/pages/public/normal/list/list?serviceName=srvspocp_store_users_select&destApp=spocp';
					break;
				case 'scan':
					this.toScan();
					break;
				case 'used':
					url = '/pages/specific/usedCoupon/usedCoupon';
					// url = '/pages/public/normal/list/list?serviceName=srvspocp_coupon_audit_market&destApp=spocp';
					break;
			}
			if (url) {
				uni.navigateTo({
					url: url
				});
			}
		},
		async selectStoreUserInfo() {
			let id_card = uni.getStorageSync('realNameInfo').user.id_card;
			if (id_card) {
				let service_name = 'srvspocp_store_users_select';
				let url = this.getServiceUrl('spocp', service_name, 'select');
				let req = {
					serviceName: 'srvspocp_store_users_select',
					colNames: ['*'],
					condition: [{ colName: 'id_card_no', ruleType: 'eq', value: id_card }]
				};
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					return res.data.data[0];
				}
			}
		},
		/*注入接口权限**/
		getSignature() {
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
			console.log('进入toScan函数');
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
	},
	async onLoad() {
		let res = await this.selectRealNameInfo();
		if (res && res.status === 'success') {
			// 已经实名认证 有实名认证信息
			this.realNameInfo = res.user;
			if (res.merchant) {
				// 有商家信息 显示商家管理菜单
				this.isMerchant = true;
				this.getSignature(); //获取微信扫一扫接口权限
				this.merchantInfo = res.merchant;
			} else {
				// 没有商家信息 提示跳转到商家登记页面
				this.setBackUrl();
				let storUserInfo = await this.selectStoreUserInfo();
				// 查找是不是店员
				if (storUserInfo && storUserInfo.store_no) {
					this.getSignature(); //获取微信扫一扫接口权限
					this.isEmployee = true;
					this.employeeInfo = storUserInfo
					if (res.employeeInfo) {
						this.merchantInfo = res.employeeInfo;
					}
				} else {
					uni.showModal({
						title: '提示',
						content: '您未注册商户，是否前往注册？',
						success(res) {
							if (res.confirm) {
								// 跳转到商家登记页面
								uni.navigateTo({
									url: '/pages/specific/merchantReg/merchantReg'
								});
							} else {
								// 跳转到首页
								uni.reLaunch({
									url: _this.$api.homePath,
									fail(res) {
										if (res.errMsg) {
											if (res.errMsg.indexOf('is not fond') !== -1 || _this.$api.homePath.indexOf('http') !== -1) {
												window.location.href = _this.$api.homePath;
											}
										}
									}
								});
							}
						}
					});
				}
			}
		}
	}
};
</script>
<style lang="scss" scoped>
.menu-wrap {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100vw;
	background-color: #f1f1f1;
	background-size: cover;
	.shop-info {
		width: 100%;
		// height: 200rpx;
		// padding-bottom: 20rpx;
		background-color: #fff;
		margin-bottom: 10rpx;
		.shop-name {
			font-size: 32rpx;
			line-height: 50rpx;
			padding: 20rpx;
			background-color: orange;
			color: #fff;
			margin-bottom: 10rpx;
		}
		.info-item {
			display: flex;
			margin: 10rpx 20rpx;
			align-items: center;
			.label {
				min-width: 150rpx;
				text-align: justify;
				text-align-last: justify;
				color: #666;
			}
			.value {
				color: #000;
			}
		}
	}
	.menu-box {
		flex-wrap: wrap;
		display: flex;
		width: 100%;
		justify-content: center;
		.menu-item {
			width: calc(100% - 40rpx);
			height: 150rpx;
			border-radius: 10rpx;
			margin: 10rpx;
			display: flex;
			padding-left: 50rpx;
			align-items: center;
			color: #fff;
			transition: all 0.5s;
			position: relative;
			font-size: 30rpx;
			background-color: #fff;
			color: #333;
			.icon {
				font-size: 60rpx;
				margin: 20rpx;
			}
			.right {
				position: absolute;
				right: 50rpx;
				color: #666;
			}
			.cont {
				display: flex;
				flex-direction: column;
				.tip {
					font-size: 20rpx;
					color: rgba($color: #333, $alpha: 0.7);
					// color: rgba($color: #fff, $alpha: 0.7);
				}
			}
			&:active {
				opacity: 0.7;
				&::after {
					content: '';
					position: absolute;
					z-index: -1;
					background-color: inherit;
					width: 100%;
					height: 100%;
					bottom: -10%;
					right: -20rpx;
					border-radius: 5px;
					opacity: 0.2;
					transform: scale(0.9, 0.9);
				}
			}
			// &:nth-child(1) {
			// 	background-color: #f37b1d;
			// }
			// &:nth-child(2) {
			// 	background-color: #19be6b;
			// }
			// &:nth-child(3) {
			// 	background-color: #2979ff;
			// }
			// &:nth-child(4) {
			// 	background-color: #1cbbb4;
			// }
		}
	}
}
</style>
