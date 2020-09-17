<template>
	<view class="wrap" :class="isOnload ? 'wrap_bus' : storeItem.store_no ? '' : 'shop-wrap'">
		<view v-if="!isShow" class="contentbox">
			<view class="coupon-list-tab">
				<scroll-view scroll-x class="bg-white nav">
					<view class="flex text-center">
						<view class="cu-item flex-sub coupon-title" v-for="(item, index) in tabData" :key="index">
							<!-- <text v-if="index==TabCur" class="line"></text> -->
							<text>{{ item.label }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		<view v-if="!isShow" class="placeholder"></view>
		<view v-if="query && query.store_no" class="from">
			<view class="list-box">
				<view class="label">商场名称：</view>
				<view class="value">{{ query._merchant_no_disp }}</view>
			</view>
			<view class="list-box">
				<view class="label">商户名称：</view>
				<view class="value">
					{{ query.store_name }}
					<text class="cuIcon-order" @click="showSelector = true" v-if="merchantList && merchantList.length > 1"></text>
				</view>
			</view>
			<view class="list-box">
				<view class="label">商家电话：</view>
				<view class="value">{{ query.store_tel }}</view>
			</view>
			<view class="list-box">
				<view class="label">营业执照号码：</view>
				<view class="value">{{ query.business_no }}</view>
			</view>
			<view class="list-box">
				<view class="label">状态：</view>
				<view>{{ query.audit_status == '审核拒绝' ? '重新提交' : query.audit_status }}</view>
			</view>
			<view v-if="query.audit_status === '审核拒绝'" class="list-box">
				<view class="label">拒绝原因：</view>
				<view class="value">{{ query.audit_remark }}</view>
			</view>
		</view>
		<view v-if="query && !query.store_no && query.merchant_no" class="from">
			<view class="list-box box">
				<view>商场logo：</view>
				<image class="img" :src="query.logo_img"></image>
			</view>
			<view class="list-box">
				<view>商场名称：</view>
				<view>
					{{ query.merchant_name }}
					<text class="cuIcon-order" @click="showSelector = true" v-if="merchantList && merchantList.length > 1"></text>
				</view>
			</view>
			<view class="list-box">
				<view>商场电话：</view>
				<view>{{ query.mobile }}</view>
			</view>
			<view class="list-box">
				<view>商场地址：</view>
				<view style="flex: 1;">{{ query.address }}</view>
			</view>
		</view>
		<view v-if="query && query.store_no" class="imglist">
			<view class="box">
				<view>营业执照</view>
				<view class="image-list-box" v-if="query.businessImgList&&query.businessImgList.length > 1">
					<bx-image-preview :src="item" class="img" v-for="(item, index) in query.businessImgList" :key="index"></bx-image-preview>
				</view>
				<bx-image-preview :src="imgsurl" class="img" v-else></bx-image-preview>
				<!-- <image @click="magnify(query.businessImg)" v-if="!query.businessImg" class="img" :src="query.businessImg"></image> -->
				<!-- <image @click="magnify(imgsurl)" v-else class="img" :src="imgsurl"></image> -->
			</view>
			<view class="box">
				<view>商户门头</view>
				<view class="image-list-box" v-if="query.storeImgList.length > 1">
					<bx-image-preview :src="item" class="img" v-for="(item, index) in query.storeImgList" :key="index"></bx-image-preview>
				</view>
				<bx-image-preview :src="imgstorurl" class="img" v-else></bx-image-preview>
				<!-- <image v-if="!query.storeImg" @click="magnify(query.storeImg)" class="img" :src="query.storeImg"></image> -->
				<!-- <image v-else @click="magnify(imgstorurl)" :src="imgstorurl"></image> -->
			</view>
		</view>
		<u-select v-model="showSelector" :list="merchantList" v-if="merchantList && merchantList.length > 0" @confirm="confirmMerchant"></u-select>
	</view>
</template>

<script>
import bxImagePreview from '@/components/bx-image-preview/bx-image-preview.vue';
export default {
	components: {
		bxImagePreview
	},
	data() {
		return {
			message: [{}],
			query: '',
			isOnload: '',
			tabData: [
				{
					label: '商户详情',
					pageInfo: 'merchant'
				}
			],
			showSelector: false,
			merchantList: [],
			result: ''
		};
	},
	props: {
		storeItem: {
			type: Object,
			default: () => {
				return {};
			}
		},
		isShow: {
			type: Boolean,
			default: false
		},
		currentUser: {
			type: String,
			default: ''
		}
	},
	onLoad(option) {
		this.isOnload = true;
		if (option && option.storeDetail) {
			let query = JSON.parse(decodeURIComponent(option.storeDetail));
			this.getFileNum(query);
		} else {
			this.query = this.storeItem;
		}
		let merchantList = [];
		if (!this.query.store_no && this.query.merchant_no) {
			merchantList = uni.getStorageSync('realNameInfo').data._merchant_user;
		} else if (this.query.store_no && !this.query.merchant_no) {
			merchantList = uni.getStorageSync('realNameInfo').data._store_user;
		}
		if (merchantList.length > 0) {
			this.merchantList = merchantList.map(item => {
				if (!item.store_no && item.merchant_no) {
					item.label = item.merchant_name;
					item.value = item.merchant_no;
					item.extra = 'merchant';
				} else if (item.store_no && !item.merchant_no) {
					item.label = item.store_name;
					item.value = item.store_no;
					item.extra = 'store';
				}
				return item;
			});
		}
	},
	onShow() {
		let self = this;
		let result = self.result;
		self.merchantList.forEach(item => {
			if (!result.value && self.currentUser === 'merchant') {
				result.value = uni.getStorageSync('realNameInfo').user._merchant_user[0].merchant_no;
			} else if (!result.value && self.currentUser === 'store') {
				result.value = uni.getStorageSync('realNameInfo').user._store_user[0].store_no;
			}
			// uni.setStorageSync('aa',result)
			if (self.currentUser === 'merchant' && item.merchant_no === result.value) {
				current__info = item;
			} else if (self.currentUser === 'store' && item.store_no === result.value) {
				current__info = item;
			}
			this.$emit('test', current__info);
			uni.setStorageSync('current__info', current__info);
		});
	},
	mounted() {
		console.log('storeItem====', this.storeItem);
		if (this.storeItem) {
			this.query = this.storeItem;
		}
	},
	computed: {
		imgsurl() {
			let query = this.query;
			if (query.businessImg) {
				let urlindex = query.businessImg.lastIndexOf('&');
				return query.businessImg.slice(0, urlindex);
			}
		},

		imgstorurl() {
			let query = this.query;
			if (query.storeImg) {
				let urlindex = query.storeImg.lastIndexOf('&');
				return query.storeImg.slice(0, urlindex);
			}
		}
	},
	watch: {
		storeItem(newValue, oldValue) {
			if (newValue) {
				this.getFileNum(newValue);
				let merchantList = [];
				if (!newValue.store_no && newValue.merchant_no) {
					merchantList = uni.getStorageSync('realNameInfo').data._merchant_user;
				} else if (newValue.store_no) {
					merchantList = uni.getStorageSync('realNameInfo').data._store_user;
				}
				if (merchantList.length > 0) {
					this.merchantList = merchantList.map(item => {
						if (!item.store_no && item.merchant_no) {
							item.label = item.merchant_name;
							item.value = item.merchant_no;
							item.extra = 'merchant';
						} else if (item.store_no) {
							item.label = item.store_name;
							item.value = item.store_no;
							item.extra = 'store';
						}
						return item;
					});
				}
			}
		},

		query(newval, old) {
			console.log('--------query-----------');
			let merchantList = [];
			if (!this.query.store_no && this.query.merchant_no) {
				merchantList = uni.getStorageSync('realNameInfo').data._merchant_user;
			} else if (this.query.store_no && !this.query.merchant_no) {
				merchantList = uni.getStorageSync('realNameInfo').data._store_user;
			}
			let current__info = {};
			if (!this.result) {
				let result = { value: '' };
				let self = this;
				// self.merchantList.forEach(item => {
				// 	if(!result.value && self.currentUser==='merchant'){
				// 		result.value = uni.getStorageSync('realNameInfo').user._merchant_user[0].merchant_no
				// 	}else if(!result.value && self.currentUser==='store'){
				// 		result.value = uni.getStorageSync('realNameInfo').user._store_user[0].store_no
				// 	}
				// 	// uni.setStorageSync('aa',result)
				// 	if(self.currentUser==='merchant'&&item.merchant_no===result.value){
				// 		current__info = item
				// 	}else if(self.currentUser==='store'&&item.store_no===result.value){
				// 		current__info = item
				// 	}
				// 	this.$emit('test',current__info)
				// 	uni.setStorageSync('current__info', current__info);
				// });
			}

			if (merchantList.length > 0) {
				this.merchantList = merchantList.map(item => {
					if (!item.store_no && item.merchant_no) {
						item.label = item.merchant_name;
						item.value = item.merchant_no;
						item.extra = 'merchant';
					} else if (item.store_no && !item.merchant_no) {
						item.label = item.store_name;
						item.value = item.store_no;
						item.extra = 'store';
					}
					return item;
				});
			}
		}
	},
	methods: {
		magnify(url) {
			let img_url = null;
			if (url.indexOf('thumbnailType') != -1) {
				let urlindex = url.lastIndexOf('&');
				img_url = url.slice(0, urlindex);
			} else {
				img_url = url;
			}
			uni.previewImage({
				urls: [img_url]
			});
		},
		confirmMerchant(e) {
			if (e && Array.isArray(e) && e.length > 0) {
				let self = this;
				let result = e[0];
				self.result = e[0];
				self.$emit('changeDetail', result);
				uni.setStorageSync('current_info', result);
				let current__info = {};
				self.merchantList.forEach(item => {
					if (self.currentUser === 'merchant' && item.merchant_no === result.value) {
						current__info = item;
						this.$emit('changeUser', {
							type: self.currentUser,
							data: item
						});
					} else if (self.currentUser === 'store' && item.store_no === result.value) {
						current__info = item;
						this.$emit('changeUser', {
							type: self.currentUser,
							data: item
						});
					}
				});
				uni.setStorageSync('current__info', current__info);
				this.$emit('test', current__info);
				console.log(e);
			}
		},
		async getFileNum(query) {
			uni.showLoading({
				title: '加载中',
				icon: 'none'
			});
			if (query.store_no) {
				let business_img = await this.getFilePath(query.business_pic);
				// .then(business_img => {
				if (Array.isArray(business_img) && business_img.length > 0) {
					query.businessImg = this.$api.getFilePath + business_img[0].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100';
					query.businessImgList = business_img.map(item => {
						return this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100';
					});
				} else {
					// 没有图片
					query.businessImgList = [];
				}
				let store_img = await this.getFilePath(query.store_pic);
				// .then(store_img => {
				if (Array.isArray(store_img) && store_img.length > 0) {
					query.storeImg = this.$api.getFilePath + store_img[0].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100';
					query.storeImgList = store_img.map(item => {
						return this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100';
					});
				} else {
					// 没有图片
					query.storeImgList = [];
				}
				uni.hideLoading();
				this.query = query;
				// });
				// });
			} else {
				let logos_img = await this.getFilePath(query.logo);
				// .then(logos_img => {
				if (Array.isArray(logos_img) && logos_img.length > 0) {
					query.logo_img = this.$api.getFilePath + logos_img[0].fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100';
					query.logo_imgList = logos_img.map(item => {
						return this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket') + '&thumbnailType=fwsu_100';
					});
				} else {
					// 没有图片
					query.logo_imgList = [];
				}
				uni.hideLoading();
				this.query = query;
				// });
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.shop-wrap {
	background-image: url(../../../static/img/regbg@2x.png);
	background-position: bottom;
	background-size: 100%;
	background-repeat: no-repeat;
	min-height: calc(100vh - 110rpx);
}
.wrap_bus {
	min-height: 100vh;
	// background-image: url(../../../static/img/regbg@2x.png);
	// background-position: bottom;
	// background-size: 100%;
	// background-repeat: no-repeat;
	// min-height: calc(100vh - 110rpx);
}
.contentbox {
	background-color: #f2f5fa !important;
	position: fixed;
	width: 100%;
	top: 0;
	z-index: 100;
}
.coupon-list-tab {
	// margin-top: 24rpx;
	.nav {
		background-color: #f5f5f5;
		.text-center {
			// margin: 0 12rpx;
			// border-radius: 16rpx;
			background-color: #c9defb;
			position: relative;
			.coupon-title {
				color: #000000;
				display: flex;
				justify-content: center;
			}
			.line {
				display: inline-block;
				width: 40upx;
				height: 3px;
				background-color: red;
				text-align: center;
				position: absolute;
				bottom: 5px;
			}
		}
	}
}
.placeholder {
	height: 110upx;
}
.wrap {
	background-color: #f2f5fa;
	// min-height: 100vh;
	.from {
		padding: 20upx 35upx;
		.list-box {
			display: flex;
			align-items: center;
			margin-bottom: 30upx;
			image {
				width: 100rpx;
				height: 100rpx;
			}
			.value {
				flex: 1;
			}
			.cuIcon-order {
				color: #3677fe;
			}
		}
	}
	.imglist {
		.box {
			text-align: center;
			padding: 30rpx 0;

			.img {
				width: 400upx;
				height: 260upx;
				margin: 20upx auto 0;
			}
			image {
				width: 400upx;
				height: 260upx;
				margin: 20upx 0;
			}
		}
	}
}
.cuIcon-order {
	margin-left: 20rpx;
	transform: rotate(90deg);
}
</style>
