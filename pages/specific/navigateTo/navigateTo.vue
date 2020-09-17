<template>
	<view></view>
</template>

<script>
export default {
	data() {
		return {};
	},
	methods: {},
	onLoad(option) {
		this.selectRealNameInfo().then(res => {
			if (res) {
				if (option.url) {
					uni.redirectTo({
						url: option.url,
						fail() {
							// #ifdef H5
							window.location.href = option.url;
							// #endif
						},
						complete() {}
					});
				} else {
					// #ifdef H5
					window.location.href = 'https://wap.lotsmall.cn/vue/custompage?id=12490&m_id=162';
					// #endif
				}
			} else {
				uni.setStorageSync('backUrl', option.url);
			}
		});
	}
};
</script>

<style lang="scss"></style>
