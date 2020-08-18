<template>
	<view class="button-box">
		<view v-for="(item, index) in buttons" :key="index">
			<button v-if="item.display !== false" @click="onclick(item)" class="cu-btn bg-blue">{{ item.button_name }}</button>
		</view>
	</view>
</template>

<script>
export default {
	name: 'bx-button',
	props: {
		buttons: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {};
	},
	methods: {
		onclick(e) {
			this.$emit('on-button-change', e);
		}
	}
};
</script>

<style lang="less" scoped>
.button-box {
	display: flex;
	justify-content: space-around;
	align-items: center;
	min-height: 100upx;
	background-color: #fff;
	width: 90%;
	margin: 10rpx auto;
	border-radius: 10rpx;
	button {
		// background-color: #0081ff;
	}
}
</style>
