<template>
	<view class="content" v-if="qrCodeData">
		<!-- <view class="top"></view> -->
		<view class="title">智慧宝塔一码通</view>
		<view class="banner">
			<dl>
				<dt><image style="margin-top: -80upx;" :src="wxUserInfo.headimgurl" mode=""></image></dt>
				<dd>{{ wxUserInfo.nickname }}</dd>
			</dl>
			<view class="img">
				<!-- <image src="/static/img/ewm.jpg" mode=""> -->
				<uni-qrcode
					v-if="qrCodeData"
					style="opacity: 0;"
					v-show="isShow"
					cid="qrcode"
					:text="qrCodeData.qr_code_str"
					:size="size"
					:logo="logo"
					makeOnLoad
					@makeComplete="makeComplete"
				></uni-qrcode>
				<view v-else class="perch"></view>
				<image class="code_img" v-show="!isShow" :src="qrcodeSrc"></image>
			</view>
			<view class="tgtit">
				<text class="left_text">更新于 {{ qrCodeData.nowTime ? qrCodeData.nowTime : qrCodeData.expired_date }}</text>
				<text @click="refreshCode" class="lg text-blue cuIcon-refresh right_text" :class="isRefresh ? 'refresh' : ''"></text>
				<!-- 推广链接：
				<text class="tugurl">http://sishuquan.com?id=3228969</text> -->
			</view>
			<view class="sharbuttn">
				<!-- <view class="btn" @click="toDetail('person')">个人信息</view> -->
				<!-- <view class="btn" @click="toDetail('merchant')">商户信息</view> -->
			</view>
		</view>
	</view>
</template>

<script>
import uQRCode from '@/common/uqrcode.js';
import uniQrcode from '@/components/uni-qrcode/uni-qrcode';
import formateDate from '@/common/js/function/formatDate.js';
export default {
	name: 'qrCodeShow',
	components: { uniQrcode },
	data() {
		return {
			providerList: [],
			sourceLink: 'http://yunzhujiao.cn/bind_pub/index.html',
			type: 0,
			qrcodeSrc: '',
			size: 250,
			logo: '../../../static/logo.png',
			qrCodeData: '',
			isRefresh: false,
			isShow: true,
			a: '151',
			textIsShow: false,
			qrtimer: '',
			wxUserInfo: uni.getStorageSync('backWxUserInfo')
		};
	},
	onLoad() {
		this.selectRealNameInfo().then(res => {
			if (res.status === 'success') {
				// 已经注册
				this.getQrCodeText();
			}
		});
	},
	beforeDestroy() {
		if (this.qrtimer) {
			clearInterval(this.qrtimer);
		}
	},
	methods: {
		toDetail(e) {
			console.log(e);
			let url = '';
			if (e == 'person') {
			} else if (e == 'merchant') {
			}
			if (url) {
				uni.navigateTo({
					url: url
				});
			}
		},
		/* 点击刷新二维码**/
		refreshCode() {
			this.isRefresh = true;
			this.textIsShow = true;
			this.a = '112232343';
			this.getQrCodeText();
		},
		/* 获取生成二维码字符串**/
		async getQrCodeText() {
			this.isShow = true;
			this.qrCodeData = '';
			const url = this.getServiceUrl('spocp', 'srvspocp_qr_code_create', 'operate');
			const req = [
				{
					serviceName: 'srvspocp_qr_code_create',
					colNames: ['*'],
					condition: [{ colName: 'qr_code_type', ruleType: 'in', value: '身份信息' }]
				}
			];
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS' && res.data.resultCode === 'SUCCESS') {
				this.qrCodeData = res.data.response[0].response;
				let nowTime = new Date();
				nowTime = formatDate(nowTime, 'YYYY-MM-DD HH:mm:ss');
				this.qrCodeData.refreshTime = nowTime;
				this.textIsShow = true;
				this.isRefresh = false;
				uni.showLoading({
					title: '二维码生成中',
					mask: true
				});
				this.qrtimer = setInterval(() => {
					this.automaticRefreshCode(this.qrCodeData.expired_date);
				}, 1000);
			}
		},
		/* 二维码生成之后得回调**/
		makeComplete(e) {
			uni.hideLoading();
			this.qrcodeSrc = e;
			this.isShow = false;
			console.log('e-------', e);
		},
		/* 自动刷新二维码**/
		automaticRefreshCode(qrCodeTime) {
			let currDate = new Date().getTime();
			let expiredDate = new Date(qrCodeTime).getTime();
			let diffDateTime = expiredDate - currDate;
			if (currDate < expiredDate && diffDateTime <= 5000) {
				this.getQrCodeText();
			}
		}
	}
};
</script>

<style scoped lang="scss">
.content {
	width: 100vw;
	height: 100vh;
	background-color: #007aff;
	padding: 20rpx 40rpx;
	.title {
		color: #fff;
		font-size: 40rpx;
		text-align: center;
		letter-spacing: 2px;
		padding: 20rpx 0;
	}
	.banner {
		width: 100%;
		background-color: #ffffff;
		border-radius: 10rpx;
		margin-top: 100rpx;
		padding: 20rpx;
		.img {
			width: 500upx;
			height: 500upx;
			/* background-color: red; */
			margin: 50rpx auto;
		}
		.img image {
			width: 100%;
			height: 100%;
		}
	}
}
.tugurl {
	color: #999;
}
.sharbuttn {
	display: flex;
	justify-content: center;
}
.perch {
	width: 200px;
	height: 200px;
}
.code_img {
	width: 200px;
	height: 200px;
}
.right_text {
	font-size: 16px;
}
.left_text {
	font-size: 16px;
	margin-right: 10upx;
}

.tgtit {
	text-align: center;
	line-height: 50rpx;
}

.banner dl dt {
	text-align: center;
}
.banner dl dt image {
	width: 160upx;
	height: 160upx;
	border-radius: 50%;
}
.banner dl dd {
	text-align: center;
}

.btn {
	width: 260upx;
	height: 60upx;
	line-height: 60upx;
	margin: 0 auto;
	margin-top: 60upx;
	border-radius: 40upx;
	border: 0;
	font-size: 26upx;
	outline: 0;
	background: #33b17b;
	color: #ffffff;
	text-align: center;
}
</style>
