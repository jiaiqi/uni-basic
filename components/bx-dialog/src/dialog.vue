<template>
	<view class="bx-dialog" :class="{ fullscreen: fullscreen }">
		<view class="dialog-main">
			<view class="title">{{ title }}</view>
			<view class="content" v-html="content"></view>
			<view class="button-box">
				<view class="button" v-for="(btn, index) in buttons" :key="btn.name" @click="navToPage(btn)">{{ btn.name }}</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'bx-dialog',
	data() {
		return {
			title: '提示',
			content: '<p>您还未实名认证,</p><p>点击确定按钮进行认证<p>',
			fullscreen: true,
			success: () => {},
			showCancel: false,
			successText: '确定',
			cancelText: '取消',
			buttons: [
				{
					name: '确定', //按钮名称
					behavior: 'navTo', //按钮动作
					targetPage: '/pages/specific/addInfo/addInfo',
					success: e => {}
				}
			]
		};
	},
	methods: {
		navToPage(e) {
			let self = this;
			if (e.behavior === 'navTo') {
				let path = window.location.href;
				let index = path.lastIndexOf('/pages/');
				let query = window.location.search;
				let backUrl = path.substring(index) + query;
				if (backUrl.indexOf('/addInfo/addInfo') !== -1) {
					uni.setStorageSync('backUrl', backUrl);
				}
				console.log(this.currentDialog);
				if (self.currentDialog && self.currentDialog.close && typeof self.currentDialog.close === 'function') {
					self.currentDialog.close();
				}
				uni.redirectTo({
					url: e.targetPage,
					fail(res) {
						if (res.errMsg) {
							if (res.errMsg.indexOf('is not fond') !== -1 || e.targetPage.indexOf('http') !== -1) {
								// #ifdef H5
								window.location.href = e.targetPage;
								// #endif
							}
						}
					},
					complete() {
						if (self.$el && self.$el.parentNode) {
							self.$el.parentNode.removeChild(self.$el);
						}
						self.$destroy();
					}
				});
			} else if (e.success && typeof e.success === 'function') {
				e.success();
				if (self.$el && self.$el.parentNode) {
					self.$el.parentNode.removeChild(self.$el);
				}
				self.$destroy();
			}
		}
	}
};
</script>

<style scoped lang="scss">
.bx-dialog {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 100vw;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	overflow: hidden;
	background-color: rgba($color: #000, $alpha: 0.1);
	color: #333;
	font-size: 28rpx;
	z-index: 99999;
	&.fullscreen {
		background-color: rgba($color: #fff, $alpha: 1);
	}
	.dialog-main {
		margin-top: 20vh;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		min-height: 300rpx;
		width: 600rpx;
		.title {
			text-align: center;
			font-weight: bold;
			font-size: 32rpx;
			line-height: 80rpx;
		}
		.content {
			padding: 50rpx 150rpx;
			text-align: center;
		}
		.button-box {
			display: flex;
			padding: 40rpx 0;
			width: 80%;
			margin: 0 auto;
			justify-content: space-around;
			.button {
				padding: 10rpx 50rpx;
				border-radius: 50rpx;
				flex: 1;
				max-width: 70%;
				text-align: center;
				// background-color: #3677ee;
				background: linear-gradient(to right, rgb(54, 119, 238) 0%, rgba(54, 119, 238, 0.9) 70%, rgba(54, 119, 238, 0.7) 100%);
				color: #fff;
				margin-left: 20rpx;
				&:first-child {
					margin-left: 0;
				}
			}
		}
	}
}
</style>
