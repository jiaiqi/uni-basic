<template>
	<view class="qrcode-detail-wrap">
		<u-navbar title="优惠券详情" :is-back="false" :title-color="color" :background="background"></u-navbar>
		<view class="cu-list menu qr-code-main" :class="[menuBorder ? 'sm-border' : '']">
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content">
					<text class="cuIcon-circlefill text-grey"></text>
					<text class="text-grey">优惠券名称：</text>
					<text class="text-grey">{{ couponInfo.coupon_name }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content">
					<text class="cuIcon-circlefill text-grey"></text>
					<text class="text-grey">优惠券类型：</text>
					<text class="text-grey">{{ couponInfo.coupon_type }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content">
					<text class="cuIcon-circlefill text-grey"></text>
					<text class="text-grey">优惠券金额：</text>
					<text class="text-grey">{{ couponInfo.consume_amount }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content">
					<text class="cuIcon-circlefill text-grey"></text>
					<text class="text-grey">优惠券使用时间：</text>
					<text class="text-grey">{{ couponInfo.used_start_time }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content">
					<text class="cuIcon-circlefill text-grey"></text>
					<text class="text-grey">优惠券到期时间：</text>
					<text class="text-grey">{{ couponInfo.used_end_time }}</text>
				</view>
			</view>
			<view class="cu-item" :class="menuArrow ? 'arrow' : ''">
				<view class="content">
					<text class="cuIcon-circlefill text-grey"></text>
					<text class="text-grey">优惠券使用条件：</text>
					<text class="text-grey">消费满足{{ couponInfo.used_amount }}元可使用</text>
				</view>
			</view>
		</view>
		<view class="btn_bot"><uni-button @click="toUseCoupon" class="cu-btn bg-red margin-tb-sm lg qr-confirm">确认使用</uni-button></view>
	</view>
</template>

<script>
export default {
	name: 'qrcodeDetail',
	components: {},
	data() {
		return {
			background: {
				backgroundColor: '#ec625c'

				// 导航栏背景图
				// background: 'url(https://cdn.uviewui.com/uview/swiper/1.jpg) no-repeat',
				// 还可以设置背景图size属性
				// backgroundSize: 'cover',

				// 渐变色
				// backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
			},
			color: '#fff',
			menuBorder: true,
			menuArrow: false,
			couponInfo: ''
		};
	},
	methods: {
		async getCouponQrcodeInfo(qr_code) {
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_qr_code_scan', 'operate');
			const req = [
				{
					serviceName: 'srvspocp_coupon_qr_code_scan',
					colNames: ['*'],
					condition: [
						{
							colName: 'qr_code',
							ruleType: 'eq',
							value: qr_code
						}
					]
				}
			];
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				let couponInfo = res.data.response[0].response.couponReceive;
				this.couponInfo = couponInfo;
			}
		},
		async toUseCoupon() {
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_used_confirm', 'operate');
			const req = [
				{
					serviceName: 'srvspocp_coupon_used_confirm',
					colNames: ['*'],
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: this.couponInfo.id
						}
					]
				}
			];
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				console.log('优惠券使用成功', res.data);
				uni.showModal({
					title: '操作成功,即将返回首页',
					showCancel: false,
					success(res) {
						if (res.confirm) {
							uni.reLaunch({
								url: this.$api.homePath
							});
						}
					}
				});
			}
		}
	},
	onLoad(option) {
		let str = option.qrcodeInfo;
		console.log('--str---', str);
		this.getCouponQrcodeInfo(str);
	}
};
</script>

<style lang="scss" scoped>
.qr-code-main {
	min-height: 70vh;
}
.btn_bot {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 2rem;
}
.qr-confirm {
	background-color: #ec625c;
	width: 80%;
}
</style>
