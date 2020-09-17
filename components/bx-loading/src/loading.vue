<template>
	<view class="loading" :style="{ backgroundColor: background || '' }" :class="{ fullscreen: fullscreen }">
		<view class="loading-area">
			<u-loading :size="size" :mode="loadingMode" v-if="loading" :color="color"></u-loading>
			<text class="loading-text">{{ text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			text: null,
			background: null,
			customClass: '',
			loading: true,
			contentBackground:null,
			fullscreen: false,
			loadingMode:"flower",
			size:"90",
			color:"#dcdfe6"
		};
	},
	methods: {
		handleAfterLeave() {
			this.$emit('after-leave');
		},
		setText(text) {
			this.text = text;
		}
	}
};
</script>
<style lang="scss">
.loading {
	height: 100vh;
	width: 100vw;
	display: flex;
	justify-content: center;
	align-items: center;
	// background-color: #f1f1f1;
	position: fixed;
	top: 0;
	z-index: 999;
	background-color: rgba($color: #000000, $alpha:0.2);
	.loading-area {
		width: 200rpx;
		background-color: rgba($color: #000000, $alpha: 1);
		min-height: 200rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		border-radius: 20rpx;
		.loading-text {
			margin: 10rpx 20rpx;
			color: #fff;
		}
	}
	&.fullscreen {
		background-color: #f1f1f1;
		.loading-area {
			background-color: transprent;
			color: #333;
		}
	}
}
</style>
