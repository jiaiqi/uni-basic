<template>
	<view class="sport-wrap">
		<view class="picker">
			<picker class="date-picker" mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
				<view class="uni-input">
					<text class="u-margin-10">{{ date }}</text>
					<u-icon name="arrow-down-fill" color="#333" size="28"></u-icon>
				</view>
			</picker>
		</view>
		<view class="foot-num">
			<view class="title">步数</view>
			<view class="content">
				<view class="number">
					<text class="actually">7452</text>
					<text class="target">/6000步</text>
				</view>
				<view class="status">
					<text class="cuIcon-check text-green" :style="{ borderColor: '#39b54a' }"></text>
					<text class="text-green u-margin-10">完成度124%</text>
				</view>
			</view>
		</view>
		<view class="foot-status">
			<view class="qiangdu">
				<view class="title">中高强度</view>
				<view class="status">
					<text class="value">44<text class="unit">分钟</text></text>
					<text class="tag bg-green light round">充足</text>
				</view>
			</view>
			<view class="xiaohao">
				<view class="title">消耗</view>
				<view class="status">
					<text class="value">423<text class="unit">千卡</text></text>
					<text class="tag bg-green light round">充足</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			date: ''
		};
	},
	computed: {
		startDate() {
			return this.getDate('start');
		},
		endDate() {
			return this.getDate('end');
		}
	},
	methods: {
		getDate(type) {
			const date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let day = date.getDate();

			if (type === 'start') {
				year = year - 60;
			} else if (type === 'end') {
				year = year + 2;
			}
			month = month > 9 ? month : '0' + month;
			day = day > 9 ? day : '0' + day;
			return `${year}-${month}-${day}`;
		}
	},
	created() {
		this.date = this.formateDate(new Date(), '年月日');
	},
	onLoad(option) {
		if(option.title){
			uni.setNavigationBarTitle({
				title:option.title
			})
		}
	}
};
</script>

<style lang="scss" scoped>
.sport-wrap {
	background-color: #f1f1f1;
	min-height: 100vh;
	.picker {
		display: flex;
		justify-content: center;
		height: 100rpx;
		align-items: center;
	}
	.foot-num {
		display: flex;
		flex-direction: column;
		margin: 0 20rpx 10rpx;
		padding: 30rpx;
		background-color: #fff;
		border-radius: 20rpx;
		.title {
			line-height: 40rpx;
			color: #999;
		}
		.content {
			display: flex;
			padding: 10rpx;
			.number {
				display: flex;
				flex: 1;
				.actually {
					font-size: 60rpx;
					font-weight: bold;
					display: flex;
					align-items: flex-end;
				}
				.target {
					font-size: 24rpx;
					display: flex;
					align-items: flex-end;
					line-height: 40rpx;
				}
			}
			.status {
				flex: 0.5;
				.cuIcon-check {
					border-radius: 50%;
					border: 1px solid;
				}
			}
		}
	}
	.foot-status {
		display: flex;
		justify-content: space-between;
		margin: 20rpx;
		.qiangdu,
		.xiaohao {
			width: calc(50% - 10rpx);
			height: 200rpx;
			background-color: #fff;
			border-radius: 20rpx;
			padding: 20rpx 40rpx;
			.title{
				font-size: 20rpx;
				color: #999;
			}
			.status{
				display: flex;
				justify-content: space-between;
				min-height: 100rpx;
				align-items: center;
				.tag{
					border-radius: 15rpx;
					padding:5rpx 10rpx ;
				}
				.value{
					font-size: 36rpx;
					font-weight: bold;
					.unit{
						font-size: 20rpx;
					}
				}
			}
		}
	}
}
</style>
