<template>
	<view></view>
</template>

<script>
export default {
	onLoad(option) {
		this.selectRealNameInfo().then(res => {
			if (!option.url) {
				uni.setStorageSync('backUrl', 'https://wap.lotsmall.cn/vue/custompage?id=12490&m_id=162');
			} else {
				uni.setStorageSync('backUrl', option.url);
			}
			if (res) {
				if (!option.url || (option.url && option.url.indexOf('/pages/') === -1 && option.url.indexOf('/navigateTo/') === -1)) {
					// #ifdef H5
					window.location.href = 'https://wap.lotsmall.cn/vue/custompage?id=12490&m_id=162';
					// #endif
				} else {
					uni.redirectTo({
						url: option.url,
						fail() {
							// #ifdef H5
							window.location.href = option.url;
							// #endif
						},
						complete() {}
					});
				}
			}
		});
	}
};
</script>

<style lang="scss"></style>
