<template>
	<view class="login">
		<view class="login-main" v-if="client_env === 'web'">
			<view class="login-logo">
				<image src="../../static/img/sun.png" mode=""></image>
				<!-- 	<view class="logo-tip">
					人们从诗人的字句里,选取自己心爱的意义
				</view> -->
			</view>
			<view class="login-list flex border-all">
				<view class="cuIcon-people flex"></view>
				<view class="login-input"><input autocomplete="off" type="text" maxlength="30" placeholder="请输入账号" class="is-input1 " v-model="user.user_no" /></view>
			</view>
			<view class="login-list flex border-all">
				<view class="cuIcon-lock flex"></view>
				<view class="login-input">
					<input autocomplete="off" type="password" maxlength="16" placeholder="请输入密码" class="is-input1 " v-model="user.pwd" @confirm="accountLogin(user)" />
				</view>
			</view>
			<!-- <button class="cu-btn login-btn" @tap="doLogin">登 录/注 册</button> -->
			<button class="cu-btn login-btn" @tap="accountLogin(user)">登 录</button>
			<view class="login-tip">
				点击登录表示同意
				<navigator class="navigator">软件许可及服务协议</navigator>
			</view>
		</view>
		<!-- #ifdef MP-WEIXIN -->
		<view class="login-footer">
			<view class="footer-tip flex">其他登录方式</view>
			<view class="footer-other flex">
				<view class="other-list">
					<button class="confirm-btn" lang="zh_CN" open-type="getUserInfo" @getuserinfo="loginAndAuth" :withCredentials="false" :disabled="disabled"></button>
					<!-- <button class="confirm-btn bg-grey" type="default" @tap="navBack" :disabled="false"></button> -->
					<!-- #ifdef H5 -->
					<!-- <view class="image" id="login_container"><image src="../../static/img/wechat.png" mode="aspectFill" @tap="login_weixin()"></image></view> -->
					<!-- #endif -->
					<!-- <view class="image"><image src="../../static/img/back.png" mode="aspectFill" @tap="login_weixin()"></image></view> -->
				</view>
			</view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
export default {
	data() {
		return {
			user: {
				user_no: '',
				pwd: ''
			},
			client_env: uni.getStorageSync('client_env')
		};
	},
	onLoad() {
		let client_env = uni.getStorageSync('client_env');
		let isLogin = uni.getStorageSync('isLogin');
		if (client_env === 'wxh5') {
			if (isLogin) {
				console.log('已登录，不进行初始化授权', uni.getStorageSync('isLogin'));
				let backUrl = uni.getStorageSync('backUrl');
				this.selectRealNameInfo().then(res => {
					if (backUrl && backUrl !== '/' && backUrl !== '/ymt/') {
						console.log('即将跳转到backUrl页面', backUrl);
						uni.redirectTo({
							url: backUrl
						});
					} else {
						console.log('即将跳转到homePath');
						uni.redirectTo({
							url: this.$api.homePath
						});
					}
				});
			} else {
				console.log('未登录，进行初始化授权', uni.getStorageSync('isLogin'));
				this.wxh5Auth();
			}
		}
	},
	methods: {
		wxh5Auth() {
			let code = this.$route.query.code;
			console.log('code', code);
			if (code) {
				const client_env = uni.getStorageSync('client_env');
				if (client_env === 'wxh5' || client_env === 'wxmp') {
					console.log('已获取到code,即将进行验证登录');
					this.saveWxUser();
				} else {
					// 非微信环境(H5或APP)
					uni.showToast({
						title: '请在微信中访问此页面',
						icon: 'none',
						duration: 3000
					});
				}
			} else {
				// 未授权 -> 获取授权
				console.log('未发现code,尝试获取重定向链接');
				this.getWxCode();
			}
		},
		getWxCode() {
			// 引导用户进入授权页面同意授权，在回调地址中获取code,获取code
			let self = this;
			let url = self.getServiceUrl('wx', 'srvwx_public_page_authorization', 'operate');
			let req = [
				{
					data: [
						{
							app_no: self.$api.appNo.wxh5,
							redirect_uri: self.$api.frontEndAddress
						}
					],
					serviceName: 'srvwx_public_page_authorization'
				}
			];
			let burl = uni.getStorageSync('backUrl');
			this.$http.post(url, req).then(response => {
				if (response.data.response[0].response.authUrl) {
					console.log('成功获取回调地址,', response.data.response);
					window.location.href = response.data.response[0].response.authUrl;
				} else {
					uni.showToast({
						title: response.data.resultMessage,
						icon: 'none'
					});
				}
			});
		},
		saveWxUser() {
			let _this = this;
			const url = this.getServiceUrl('wx', 'srvwx_app_login_verify', 'operate');
			let req = [
				{
					data: [
						{
							code: _this.$route.query.code,
							app_no: _this.$api.appNo.wxh5
						}
					],
					serviceName: 'srvwx_app_login_verify'
				}
			];
			console.log('saveWxUser请求参数:', req);
			_this.$http.post(url, req).then(response => {
				if (response.data.resultCode === 'SUCCESS' && response.data.response[0].response) {
					console.log('授权成功', response);
					let resData = response.data.response[0].response;
					let loginMsg = {
						bx_auth_ticket: resData.bx_auth_ticket,
						expire_time: resData.expire_time
					};
					uni.setStorageSync('isLogin', true);
					console.log('登录成功', uni.getStorageSync('isLogin'), resData);
					let expire_timestamp = parseInt(new Date().getTime() / 1000) + loginMsg.expire_time; //过期时间的时间戳(秒)
					uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
					// let expire_timestamp = parseInt(new Date().getTime() / 1000) + 10; //过期时间的时间戳(秒)
					// uni.setStorageSync('expire_time', 10); // 有效时间
					uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
					uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
					if (resData.login_user_info && resData.login_user_info.user_no) {
						uni.setStorageSync('login_user_info', resData.login_user_info);
						console.log('login_user_info', resData.login_user_info);
					}
					if (resData.login_user_info && resData.login_user_info.data) {
						uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
						uni.setStorageSync('login_user_info', resData.login_user_info);
						console.log('visiter_user_info', resData.login_user_info);
					}
					// 获取回调前记录的url 并再回调后 再次进入该url，没有该url时 进入 home
					let backUrl = uni.getStorageSync('backUrl');
					console.log('_this.backUrl', '===', backUrl);
					_this.selectRealNameInfo().then(result => {
						if (backUrl && backUrl !== '/') {
							backUrl = _this.getDecodeUrl(backUrl);
							if (backUrl && backUrl.lastIndexOf('backUrl=') !== -1) {
								backUrl = backUrl.substring(backUrl.lastIndexOf('backUrl=') + 8, backUrl.length);
								console.log('授权成功，准备返回用户界面backUrl', backUrl);
							}
							uni.reLaunch({
								url: backUrl
							});
						} else {
							uni.reLaunch({
								url: _this.$api.homePath
							});
						}
					});
				} else {
					uni.setStorageSync('isLogin', false);
					console.log('授权失败');
					// uni.showToast({
					// 	title:'授权失败',
					// 	icon:'none'
					// })
				}
			});
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
		// 		debugger
		// 		if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
		// 			uni.setStorageSync('realNameInfo', {
		// 				status: 'success',
		// 				data: res.data.data[0],
		// 				_merchant_user:res.data._merchant_user
		// 			});
		// 			console.log('用户信息:', res.data.data[0]);
		// 			return res.data.data[0];
		// 		} else {
		// 			console.log('未查询到用户实名信息:', res.data);
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
		loginAndAuth(e) {
			//登录并授权
			console.log(e);
			if (e.type === 'getuserinfo' && e.detail.errMsg === 'getUserInfo:ok') {
				let userInfo = e.detail.userInfo;
				uni.setStorageSync('wxuserinfo', userInfo);
			}
			this.wechatLogin();
		},
		async accountLogin(user) {
			// 账号登录
			let _this = this;
			uni.hideKeyboard(); //隐藏软键盘
			console.log('srvuser_login', user);
			if (Object.values(user).length < 2) {
				uni.showToast({
					title: '请检查账号密码是否正确输入',
					icon: 'none'
				});
			}
			let url = this.getServiceUrl('sso', 'srvuser_login', 'operate');
			let req = [
				{
					serviceName: 'srvuser_login',
					data: [user]
				}
			];
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.response) {
				// 登录成功
				uni.setStorageSync('isLogin', true);
				if (Array.isArray(res.data.response) && res.data.response.length > 0) {
					let response = res.data.response[0].response;
					console.log(response);
					uni.setStorageSync('bx_auth_ticket', response.bx_auth_ticket);
					uni.setStorageSync('expire_time', response.expire_time);
					uni.setStorageSync('login_user_info', response.login_user_info);
					uni.$emit('loginData', response);
					// return response;
				}
				let backUrl = uni.getStorageSync('backUrl');
				console.log(backUrl, 'backUrl');
				this.selectRealNameInfo();
				this.getWxUserInfo()
				if (backUrl) {
					// uni.navigateTo({
					// 	url: backUrl
					// })
					// uni.navigateBack({});
					uni.reLaunch({
						url: backUrl
					});
				} else {
					uni.navigateTo({
						url: _this.$api.homePath
					});
					// uni.reLaunch({
					// 	url: _this.$api.homePath
					// });
				}
			}
		},
		wechatLogin() {
			// 进行微信登录流程并尝试获取微信的userInfo
			let _this = this;
			uni.checkSession({
				success(res) {
					// session_key 未过期，并且在本生命周期一直有效
					console.log('uni.checkSession', res);
					let isLogin = uni.getStorageSync('isLogin');
					if (!isLogin) {
						_this.uniLogin();
					}
				},
				fail(res) {
					// session_key 已经失效，需要重新执行登录流程
					console.log('uni.checkSession-fail', res);
					_this.uniLogin();
				}
			});
		},
		uniLogin() {
			// 微信登录
			let _this = this;
			uni.login({
				provider: 'weixin',
				success: function(loginRes) {
					console.log(loginRes);
					_this.verifyLogin(loginRes.code).then(res => {
						console.log(res, 'login-res');
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						uni.navigateBack();
						_this.getUserInfo();
					});
				}
			});
		},
		getUserInfo() {
			// 获取用户信息
			uni.getUserInfo({
				provider: 'weixin',
				success: function(infoRes) {
					console.log('用户昵称为：' + infoRes.userInfo.nickName);
					uni.setStorageSync('wxuserinfo', infoRes.userInfo);
				}
			});
		},
		checkGuide() {
			// 思路： 检测是否有启动缓存，如果没有，就是第一次启动，第一次启动就去 启动介绍页面
			const launchFlag = uni.getStorageSync('launchFlag');
			if (launchFlag) {
				this.isLogin();
			} else {
				uni.redirectTo({
					url: '/pages/guide/list'
				});
			}
		}
	}
};
</script>

<style lang="scss" scoped>
page {
	background-color: #ffffff;
}
.color-normal {
	color: #1abc9c;
}
.flex {
	display: flex;
}
.login {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.login-main {
	flex: 1;
	padding: 0 70upx;
	.login-logo {
		width: 200upx;
		height: 200upx;
		margin: 150upx auto;
		image {
			width: 100%;
			height: 100%;
		}
	}

	.logo-tip {
		text-align: center;
		padding-top: 25upx;
		font-size: 32upx;
		font-weight: 200;
		color: rgba(51, 51, 51, 1);
		padding-bottom: 50upx;
	}

	.login-list {
		margin-top: 35upx;
		height: 100upx;
		align-items: center;
		padding: 0 30upx;

		&.border-all {
			border: 1px solid #d0d0d0;
			border-radius: 100upx;
		}
		.login-input {
			flex: 1;

			input {
				font-size: 28upx;
				color: #333333;
				padding-left: 20upx;
			}
		}

		.code-sx {
			content: '';
			width: 2upx;
			height: 25upx;
			background: #d0d0d0;
			margin-right: 25upx;
		}

		.codeimg {
			font-size: 24upx;
			color: #999999;
		}
	}

	.login-btn {
		margin-top: 70upx;
		height: 96upx;
		width: 100%;
		// background: linear-gradient(-90deg, rgba(80, 85, 168, 1), rgba(104, 110, 210, 1));
		background-color: #1abc9c;
		border-radius: 47upx;
		font-size: 34upx;
		color: #ffffff;
	}

	.login-tip {
		padding-top: 26upx;
		font-size: 22upx;
		color: #666666;
		text-align: center;

		.navigator {
			margin-left: 10upx;
			display: inline-block;
			color: #1abc9c;
		}
	}
}

.login-footer {
	padding: 0 70upx;
	.footer-tip {
		align-items: center;
		font-size: 24upx;
		color: #999999;
		text-align: center;

		&:before {
			flex: 1;
			content: '';
			height: 2upx;
			background: #d0d0d0;
			margin-right: 30upx;
		}

		&:after {
			margin-left: 30upx;
			flex: 1;
			content: '';
			height: 2upx;
			background: #d0d0d0;
		}
	}

	.footer-other {
		padding: 40upx 0 100upx 0;
		justify-content: center;
		display: flex;
		.other-list {
			display: flex;
			width: 300rpx;
			justify-content: space-around;
			.image {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				overflow: hidden;
				border: 1px solid #d1d1d1;
				display: flex;
				justify-content: center;
				align-items: center;
				image {
					width: 70%;
					height: 70%;
				}
			}
			.confirm-btn {
				width: 100rpx;
				height: 100rpx;
				border: none;
				background-color: #fff;
				background-image: url(../../static/img/wechat.png);
				background-size: 70%;
				background-position: center;
				background-repeat: no-repeat;
				border-radius: 50%;
				overflow: hidden;
				border: 1px solid #d1d1d1;
			}
			button::after {
				border: none;
			}
		}
	}
}
input:-webkit-autofill {
	-webkit-box-shadow: 0 0 0px 1000px white inset;
}
</style>
