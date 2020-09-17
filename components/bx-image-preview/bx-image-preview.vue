<template>
	<view class="image-box" :class="{ 'preview-image': isPreview }">
		<image
			@click="isPreview = !isPreview"
			@load="imageLoad"
			class="image"
			v-if="url"
			:src="url"
			alt="正在加载"
			:style="isPreview && width && height ? `width:${width}rpx;height:${height}rpx` : ''"
		></image>
		<view class="hasnot-src" v-else-if="!url && !src">图片地址无效</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isPreview: false,
			width: 0,
			height: 0,
			url: '',
			loadingInstance: null,
			isLoad: false //原图是否加载完成
		};
	},
	props: {
		src: {
			type: String,
			default: ''
		}
	},
	watch: {
		isPreview(newValue, oldValue) {
			if (newValue) {
				let img_url = '';
				if (this.src.indexOf('&thumbnailType=fwsu_100') !== -1) {
					img_url = this.src.substring(0, this.src.indexOf('&thumbnailType=fwsu_100'));
				} else {
					img_url = this.src;
				}
				this.url = img_url;
				this.previewImage();
				if (!this.isLoad) {
					this.loadingInstance = this.$loading({
						lock: true,
						text: '图片加载中', //提示文字
						fullscreen: false, // 是否全屏背景
						loadingMode: 'flower', //加载样式 circle-圆环 flower-...
						size: '90', //加载的图标的大小 fontsize
						textColor: '#000', //提示文字的color
						// color:"#009688" // mode为circle时 可以设置圆环颜色
						background: 'rgba(255, 255,255, 1)' //遮罩的背景颜色
					});
				}
			}
		}
	},
	mounted() {
		let img_url = '';
		if (this.src.indexOf('thumbnailType=fwsu_100') != -1) {
			img_url = this.src;
		} else {
			img_url = this.src + '&thumbnailType=fwsu_100';
		}
		this.url = img_url;
	},
	methods: {
		imageLoad(e) {
			// 图片加载完成
			if (this.isPreview) {
				this.isLoad = true;
			}
			this.loadingInstance ? this.loadingInstance.close() : '';
		},
		async previewImage() {
			if (!this.src) {
				return;
			}
			let info = await this.getImageInfo(this.url);
			let { width, height } = info;
			let maxWidth = width;
			if (width > 750 || height > 1334) {
				if (width >= height) {
					height = Math.floor(height * (750 / width));
					width = 750;
				} else {
					width = Math.floor(width * (1334 / height));
					height = 1334;
					if (width > 750) {
						// 图片超出屏幕宽度，高度、宽度等比例缩小至宽度等于屏幕宽度
						height = parseInt(height / (width / 750));
						width = 750;
					}
				}
			}
			this.width = width;
			this.height = height;
		},
		getImageInfo(src) {
			return new Promise((resolve, reject) => {
				uni.getImageInfo({
					src,
					success: info => {
						resolve(info);
					},
					fail: () => {
						reject(null);
					}
				});
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.image-box {
	width: 100%;
	height: 100%;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
	transform: all 1s;
	.image {
		width: 100%;
		height: 100%;
	}
	.hasnot-src {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #999;
	}
	&.preview-image {
		display: flex;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw !important;
		height: 100vh !important;
		z-index: 999;
		background-color: #000000 !important;
		margin: 0 !important;
		justify-content: center;
		align-items: center;
		.image {
			width: 750rpx;
			height: auto;
		}
	}
}
</style>
