<template>
	<view class="login">
		<view class="login-main">
			<view class="login-logo">
				<image src="../../static/img/sun.png" mode=""></image>
				<!-- 	<view class="logo-tip">
					人们从诗人的字句里,选取自己心爱的意义
				</view> -->
			</view>
			<view class="login-list flex border-all">
				<view class="cuIcon-people  flex"></view>
				<view class="login-input"><input autocomplete="off" type="text" maxlength="30" placeholder="请输入账号" class="is-input1 " v-model="user.user_no" /></view>
			</view>
			<view class="login-list flex border-all">
				<view class="cuIcon-lock  flex"></view>
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
		<view class="login-footer">
			<!-- #ifdef MP-WEIXIN -->
			<view class="footer-tip flex">其他登录方式</view>
			<!-- #endif -->
			<view class="footer-other flex">
				<view class="other-list">
					<!-- #ifdef MP-WEIXIN -->
					<button class="confirm-btn" lang="zh_CN" open-type="getUserInfo" @getuserinfo="loginAndAuth" :withCredentials="false" :disabled="disabled"></button>
					<!-- #endif -->
					<!-- <button class="confirm-btn bg-grey" type="default" @tap="navBack" :disabled="false"></button> -->
					<!-- #ifdef H5 -->
					<!-- <view class="image" id="login_container"><image src="../../static/img/wechat.png" mode="aspectFill" @tap="login_weixin()"></image></view> -->
					<!-- #endif -->
					<!-- <view class="image"><image src="../../static/img/back.png" mode="aspectFill" @tap="login_weixin()"></image></view> -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			user: {
				user_no: '',
				pwd: ''
			}
		};
	},
	onLoad() {
		// this.checkGuide();
	},
	methods: {
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
				if (Array.isArray(res.data.response) && res.data.response.length > 0) {
					let response = res.data.response[0].response;
					console.log(response);
					debugger;
					uni.setStorageSync('bx_auth_ticket', response.bx_auth_ticket);
					uni.setStorageSync('expire_time', response.expire_time);
					uni.setStorageSync('login_user_info', response.login_user_info);
					return response;
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
					_this.verifyLogin(loginRes.code);
					_this.getUserInfo();
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
		},
		//QQ登录
		login_qq() {
			let _this = this;
			uni.login({
				provider: 'qq',
				success: function(loginRes) {
					// 获取用户信息
					uni.getUserInfo({
						provider: 'qq',
						success: function(infoRes) {
							_this.other_login(loginRes, infoRes, 'qq');
						}
					});
				}
			});
		},
		//微信登录
		async login_weixin() {
			let _this = this;
			// #ifdef MP
			uni.login({
				provider: 'weixin',
				success: function(loginRes) {
					// 获取用户信息
					uni.getUserInfo({
						provider: 'weixin',
						success: function(infoRes) {
							_this.other_login(loginRes, infoRes, 'wx');
						}
					});
				}
			});
			// #endif
			// #ifdef H5
			let url = this.getServiceUrl('wx2', 'srvwx_web_scan_cfg_select', 'select');
			
			// srvwx_web_scan_cfg_select
			!(function(a, b, c) {
				function d(a) {
					var c = 'default';
					a.self_redirect === !0 ? (c = 'true') : a.self_redirect === !1 && (c = 'false');
					var d = b.createElement('iframe'),
						e =
							'https://open.weixin.qq.com/connect/qrconnect?appid=' +
							a.appid +
							'&scope=' +
							a.scope +
							'&redirect_uri=' +
							a.redirect_uri +
							'&state=' +
							a.state +
							'&login_type=jssdk&self_redirect=' +
							c +
							'&styletype=' +
							(a.styletype || '') +
							'&sizetype=' +
							(a.sizetype || '') +
							'&bgcolor=' +
							(a.bgcolor || '') +
							'&rst=' +
							(a.rst || '');
					(e += a.style ? '&style=' + a.style : ''),
						(e += a.href ? '&href=' + a.href : ''),
						(d.src = e),
						(d.frameBorder = '0'),
						(d.allowTransparency = 'true'),
						(d.scrolling = 'no'),
						(d.width = '300px'),
						(d.height = '400px');
					var f = b.getElementById(a.id);
					(f.innerHTML = ''), f.appendChild(d);
				}
				a.WxLogin = d;
			})(window, document);
			var obj = new WxLogin({
				self_redirect: false,
				id: 'login_container',
				appid: 'wxd016be5549cfc967',
				scope: 'snsapi_login',
				redirect_uri: '/pages/login/login',
				state: 'success',
				style: 'black',
				href: window.location.origin + '/main/css/loginqrcode.css'
			});
			// #endif
		},
		//授权登录
		other_login(loginRes, infoRes, type) {
			let _this = this;
			let url;
			let pram = {};
			// _this.loginRes=JSON.stringify(loginRes).toString();
			// _this.infoRes=JSON.stringify(infoRes).toString();
			switch (type) {
				case 'qq':
					url = '/token/sys/login-qq';
					pram = {
						openid: loginRes.authResult.openid,
						nickname: infoRes.userInfo.nickname,
						gender: infoRes.userInfo.gender,
						province: infoRes.userInfo.province,
						city: infoRes.userInfo.city,
						figureurl: infoRes.userInfo.figureurl_qq
					};
					break;
				case 'wx':
					url = '/token/sys/login-wechat';
					pram = {
						openid: loginRes.authResult.openid,
						nickname: infoRes.userInfo.nickName,
						sex: infoRes.userInfo.gender,
						province: infoRes.userInfo.province,
						city: infoRes.userInfo.city,
						country: infoRes.userInfo.country,
						headimgurl: infoRes.userInfo.avatarUrl,
						unionid: loginRes.authResult.unionid
					};
					break;
				default:
			}
			uni.request({
				url: _this.websiteUrl + url,
				data: pram,
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				success: res => {
					if (res.data.code == 200) {
						//_this.testData=JSON.stringify(res.data.data).toString();;
						_this.login(true, res.data.data, function() {
							_this.getRongyToken();
						});
					}
				}
			});
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
