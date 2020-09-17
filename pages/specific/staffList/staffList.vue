<template>
	<view class="wrap0">
		<view class="list-wrap" v-if="staffData.listData && staffData.listData.length > 0">
			<view class="card_box" v-for="(item, index) in staffData.listData" :key="index">
				<view class="lefts">
					<view class="">{{ staffData.lableInfo.labelOne }}：{{ item[staffData.lableInfo.labelOneKey] }}</view>
					<view v-if="persentPages === 'storeStaff'" class="">{{ staffData.lableInfo.labelTwo }}：{{ item[staffData.lableInfo.labelTwoKey] }}</view>
					<view v-if="persentPages === 'record'" class="">消费者：{{ item.usedUserInfo.name }}</view>
					<view v-if="persentPages === 'record'" class="">优惠券名称：{{ item.coupon_name }}</view>
					<view v-if="persentPages === 'record'" class="">使用时间：{{ item.confirm_time }}</view>
					<view v-if="persentPages === 'staff'" class="">身份：{{ item.identity }}</view>
					<view v-if="persentPages === 'staff'" class="">身份证号：{{ item.id_card_no }}</view>
				</view>

				<view
					@click="delItem(item)"
					v-if="userType === 'merchant' && item.principal_no != userInfo.auth_user_no && persentPages != 'record' && currentInfo.identity === '管理员'"
					class="rights cu-btn sm line-blue merchant-delete"
				>
					删除
				</view>
				<view
					@click="delItem(item)"
					v-if="userType === 'store' && item.user_no !== userInfo.auth_user_no && persentPages != 'record' && currentInfo.is_manager === '是'"
					class="rights cu-btn sm line-blue store-delete"
				>
					删除
				</view>
				<!-- <view v-else class="">{{ staffData.lableInfo.time }}：{{ item[staffData.lableInfo.timeKey] }}</view> -->
			</view>
			<!-- <view class="">{{staffData.btn.label}}</view> -->
		</view>
		<view v-if="staffData.listData && staffData.listData.length <= 0 && persentPages == 'staff'" class="none-data">暂无数据</view>
		<view v-if="staffData.listData && staffData.listData.length <= 0 && persentPages == 'record'" class="none-data record-none-data">
			<image src="/static/img/couopn.png"></image>
			<view class="">暂无数据</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		staffData: {
			type: Object,
			default: () => {
				return {};
			}
		},
		currentInfo: {
			type: Object,
			default: () => {
				return {};
			}
		},
		userType: {
			type: String,
			default: ''
		},
		persentPages: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			current__info: uni.getStorageSync('current__info'),
			userInfo: uni.getStorageSync('realNameInfo').user
		};
	},
	methods: {
		async delItem(item) {
			let self = this;
			uni.showModal({
				title: '提示',
				content: '是否确认删除?',
				success: res => {
					if (res.confirm) {
						self.$emit('dels', item);
					}
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.wrap0 {
	// background-color:#f2f5fa ;
	// min-height: calc(100vh - 110rpx);
	overflow: hidden;
	.list-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-direction: column;
		width: 100%;
		// background-color: #fff;
		// padding: 16upx 40upx;
		// color: #565555;
		font-size: 28upx;
		line-height: 44upx;
		margin: 0;
		margin-bottom: 40upx;
		.card_box {
			display: flex;
			justify-content: space-between;
			width: 100%;
			padding: 10upx 45upx;
			background-color: #fff;
			align-items: center;
			// color: #bdb7b7;
			font-size: 28upx;
			margin-bottom: 40upx;
			.rights {
				display: flex;
				align-items: center;
			}
		}
	}
	.none-data {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 55px);
	}
	.record-none-data {
		color: #cccccc;
		image {
			width: 100rpx;
			height: 100rpx;
		}
		display: flex;
		flex-direction: column;
	}
}
</style>
