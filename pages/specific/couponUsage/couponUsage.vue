<template>
	<view class="coupon_useage_wrap">
		<view class="coupon_top">
			<!-- <view class="coupon_title">智慧宝塔</view> -->
			<view class="coupon_main_codewrap">
				<view class="coupon_top_title">{{ couponData.coupon_name }}</view>
				<view class="coupon_main_qrcode"><canvas canvas-id="qrcode" style="width: 200px;height: 200px;border: 1px solid #ccc;" /></view>
			</view>
			<view class="coupon_main">
				<view class="coupon_main_info">
					<view class="title">
						使用须知
					</view>
					<view class="coupon_main_info_useTime">可用时间：{{ couponData.used_start_time }}后</view>
					<view class="coupon_main_info_endTime">过期时间：{{ couponData.used_end_time }}</view>
					<view class="coupon_main_info_endTime">使用条件：景区消费满{{ couponData.consume_amount }}元可用</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uQRCode from '@/common/uqrcode.js';
export default {
	name: 'getCoupon',
	data() {
		return {
			couponData: '',
			qrcodeInfo: '',
			qrtimer: ''
		};
	},
	onLoad(option) {
		console.log('接收优惠券信息', option);
		let query = JSON.parse(decodeURIComponent(option.couponItem));
		this.couponData = query;
		console.log('接收优惠券信息', query);
		this.getQrcodeStr();
	},
	methods: {
		make() {
			let qrcodeInfo = this.qrcodeInfo;
			console.log('this.qrcodeInfo', this.qrcodeInfo);
			uQRCode.make({
				canvasId: 'qrcode',
				componentInstance: this,
				text: qrcodeInfo.qr_code_str,
				size: 200,
				margin: 10,
				backgroundColor: '#ffffff',
				foregroundColor: '#000000',
				fileType: 'jpg',
				correctLevel: 0,
				success: res => {
					console.log(res);
				}
			});
		},
		async getQrcodeStr() {
			let self = this;
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_qr_code', 'operate');
			const req = [
				{
					serviceName: 'srvspocp_coupon_qr_code',
					colNames: ['*'],
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: this.couponData.id
						}
					]
				}
			];
			let res = await this.$http.post(url, req);
			console.log('res===', res.data.response[0].response);
			if (res.data.state === 'SUCCESS') {
				this.qrcodeInfo = res.data.response[0].response;
				this.make();
				this.qrtimer = setInterval(() => {
					let nowDate = new Date().getTime();
					let pastdueDate = new Date(this.qrcodeInfo.expired_date).getTime();
					if (pastdueDate - nowDate <= 5000) {
						self.getQrcodeStr();
					}
				}, 1000);
			}
		}
	},
	beforeDestroy() {
		if (this.qrtimer) {
			clearInterval(this.qrtimer);
		}
	}
};
</script>

<style scoped lang="scss">
.coupon_useage_wrap {
	width: 100%;
	height: 100vh;
	background-color: #007aff;
	display: flex;
	justify-content: center;
	padding-top: 50rpx;
	.coupon_top {
		display: flex;
		// justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 95%;
		padding-top: 50rpx;
		.coupon_title {
			color: #fff;
			font-size: 40rpx;
			line-height:100rpx;
			display: flex;
			// justify-content: center;
			width: 90%;
		}
		.coupon_main_codewrap {
			width: 90%;
			background: white;
			// border-top-right-radius: 10rpx;
			// border-top-left-radius: 10rpx;
			.coupon_top_title {
				display: flex;
				justify-content: center;
				font-weight: 600;
				width: 100%;
				padding:20rpx 0 0;
				color: #333;
				// color: #DD524D;
				font-size:35rpx;
			}
			.coupon_main_qrcode {
				display: flex;
				justify-content: center;
				padding: 30px 0;
				// border-top: 1px dashed #ccc;
			}
		}
		.coupon_main {
			width: 90%;
			background: white;
			display: flex;
			justify-content: center;
			flex-direction: column;
			// border-bottom-right-radius: 10rpx;
			// border-bottom-left-radius: 10rpx;
			padding-top: 20rpx;
			.coupon_main_info {
				.title{
					padding-top: 20rpx;
					border-top: 1px dashed #cccccc;
					font-size: 40rpx;
					font-weight: 700;
					margin: 0 20rpx;
				}
				.coupon_main_info_useTime {
					margin:20rpx 40upx;
				}
				.coupon_main_info_endTime {
					margin:20rpx 40upx;
				}
			}
		}
	}
}
</style>
