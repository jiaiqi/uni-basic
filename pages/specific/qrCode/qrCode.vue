<template>
	<view class="qr-code-warp ">
		<!-- <view class=" content"> -->
		<view class="c-form">
			<view class="c-form-item">
				<view class="label">姓名</view>
				<view class="value">{{ realNameInfo ? realNameInfo.name : '' }}</view>
			</view>
			<view class="c-form-item">
				<view class="label">证件号码</view>
				<view class="value">{{ realNameInfo ? realNameInfo.id_card : '' }}</view>
			</view>
		</view>
		<view class="tip">
			<view class="title"><view class="text">我的票据二维码</view></view>
			<view class="content-text">市民可通过电子身份二维码在全域景点进行扫码入场，无需携带卡片身份证</view>
		</view>
		<view class="qr-code-box">
			<view>
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
				<image class="code_img" v-show="!isShow" :src="qrcodeSrc"></image>
				<view class="tip-text" v-show="!isShow">
					<view v-show="!iconIsShow" class="tgtit">
						<text class="left-text margin-right-xs">更新于{{ refreshTime }}</text>
						<text @click="refreshCode" class="lg text-blue cuIcon-refresh right_text"></text>
					</view>
					<view v-show="iconIsShow" class="tgtit">
						<text class="lg text-blue cuIcon-roundcheckfill right_text"></text>
						<text>已刷新</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 	<view class="title">智慧宝塔一码通</view>
		<view class="banner">
			<view class="img">
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
			<view v-show="!iconIsShow" class="tgtit">
				<text class="left_text">个人信息自动刷新</text>
				<text @click="refreshCode" class="lg text-blue cuIcon-refresh right_text" :class="isRefresh ? 'refresh' : ''"></text>
			</view>
			<view v-show="iconIsShow" class="tgtit">
				<text class="lg text-blue cuIcon-roundcheckfill right_text"></text>
				<text>已刷新</text>
			</view>
			<view class="sharbuttn">
			</view>
		</view> -->
	</view>
</template>

<script>
import uQRCode from '@/common/uqrcode.js';
import uniQrcode from '@/components/uni-qrcode/uni-qrcode';
import formatDate from '@/common/js/function/formatDate.js';
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
			logo: '/static/img/tower.jpg',
			// logo: '/static/logo.png',
			qrCodeData: '',
			isRefresh: false,
			isShow: true,
			a: '151',
			textIsShow: false,
			qrtimer: '',
			wxUserInfo: uni.getStorageSync('backWxUserInfo'),
			iconIsShow: false,
			refreshTime: '',
			realNameInfo: {}
		};
	},

	mounted() {
		let realNameInfo = uni.getStorageSync('realNameInfo');
		if (realNameInfo && realNameInfo.data) {
			this.realNameInfo = realNameInfo.data;
		}
	},
	onLoad() {
		this.selectRealNameInfo().then(res => {
			if (res && res.status === 'success') {
				// 已经注册
				this.realNameInfo = res.data;
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
			this.getQrCodeText();
		},
		/* 获取生成二维码字符串**/
		async getQrCodeText() {
			// return
			this.isShow = true;
			this.refreshTime = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
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
				setTimeout(() => {
					this.iconIsShow = true;
				}, 500);
				setTimeout(() => {
					this.iconIsShow = false;
				}, 2000);
				this.qrtimer = setInterval(() => {
					this.automaticRefreshCode(this.qrCodeData.expired_date);
				}, 1000);
			}
		},
		/* 二维码生成之后得回调**/
		makeComplete(e) {
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
.qr-code-warp {
	width: 100%;
	height: 100vh;
	background-color: #eaf1fd;
	// background-color: #e1eafa;
	box-sizing: border-box;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	.c-form {
		// margin: 50rpx;
		font-size: 28rpx;
		margin: 20rpx;
		margin-bottom: 50rpx;
		.c-form-item {
			color: #3677fe;
			&:first-child {
				margin-bottom: 30rpx;
			}
			.value {
				margin-top: 8rpx;
			}
		}
	}
	.tip {
		min-height: 300rpx;
		width: 100%;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx 50rpx;
		.title {
			display: flex;
			margin: 0;
			padding: 0;
			color: #333;
			font-size: 32rpx;
			text-indent: 20px;
			line-height: 60rpx;
			position: relative;
			&::before {
				content: '';
				position: absolute;
				left: 0px;
				height: 28rpx;
				top: 14rpx;
				width: 5px;
				background-color: #3677fe;
			}
		}
		.content-text {
			color: #77818c;
			line-height: 48rpx;
			margin-top: 30rpx;
		}
	}
	.qr-code-box {
		display: flex;
		justify-content: center;
		margin-top: 80rpx;
		.code_img {
			width: 200px;
			height: 200px;
			border: none;
			margin: 0;
			padding: 0;
		}
		.tip-text {
			.left-text {
				font-size: 26rpx;
			}
		}
	}
}
.content {
	height: 100vh;
	width: 100vw;
	background-color: #e1eafa;
	// background-color: #007994;
	.title {
		color: #fff;
		font-size: 40rpx;
		text-align: center;
		letter-spacing: 2px;
		padding: 100rpx 0 50rpx;
	}
	.banner {
		background-color: #ffffff;
		border-radius: 10rpx;
		margin: 50rpx;
		padding: 75rpx 50rpx 50rpx;
		.img {
			width: 500upx;
			height: 500upx;
			margin: 0 auto;
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
	border: 1px solid #cccccc;
	padding: 20rpx;
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
	margin-top: 20rpx;
	display: flex;
	justify-content: center;
	align-items: center;
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
