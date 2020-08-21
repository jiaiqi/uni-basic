<template>
	<view class="index-wrap">
		<u-button type="primary" shape="circle" :ripple="true" @click="toPage('person')">个人信息</u-button>
		<u-button type="success" shape="circle" :ripple="true" @click="toPage('get')">领取优惠券</u-button>
		<u-button type="warning" shape="circle" :ripple="true" v-if="showMerchantList" @click="toPage('list')">店员管理</u-button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			showMerchantList: false
		};
	},
	onLoad() {
		this.selectRealNameInfo().then(res => {
			// 查询实名信息
			if (res&&res.data && res.data.status === 'success') {
				if (res.data._merchant_user) {
					this.showMerchantList = true;
				}
			}
		});
	},
	methods: {
		toPage(e) {
			let url = '';
			switch (e) {
				case 'person':
					url = '/pages/specific/qrCodeShow/qrCodeShow';
					break;
				case 'get':
					url = '/pages/specific/couponList/couponList';
					break;
				case 'list':
					url = 'pages/specific/merchantList/merchantList';
					break;
			}
			if (url) {
				uni.navigateTo({
					url: url
				});
			}
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
	// justify-content: center;
	.u-btn {
		min-width: 60vw;
		margin-top: 50rpx;
	}
}
</style>
