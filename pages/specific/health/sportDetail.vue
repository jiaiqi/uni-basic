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
					<text class="value">
						44
						<text class="unit">分钟</text>
					</text>
					<text class="tag bg-green light round">充足</text>
				</view>
			</view>
			<view class="xiaohao">
				<view class="title">消耗</view>
				<view class="status">
					<text class="value">
						423
						<text class="unit">千卡</text>
					</text>
					<text class="tag bg-green light round">充足</text>
				</view>
			</view>
		</view>
		<view class="foot-record">
			<text class="title">运动记录</text>
			<bx-list class="list-wrap" :list="stepRecord" :top="580" v-slot:listitem="{data}">
				<view class="list-item record-item">
					<view class="date">{{ data.date }}</view>
					<view class="icon"><text class="iconfont icon-yundong"></text></view>
					<view class="step-number">
						<text class="number">{{ data.stepNum }}</text>
						<text class="unit">步</text>
					</view>
					<view class="calorie">
						<text class="number">{{ data.calorie }}</text>
						<text class="unit">千卡</text>
					</view>
				</view>
			</bx-list>
		<!-- 	<view class="record-item" v-for="(item, index) in stepRecord" :key="index">
				<view class="date">{{ item.date }}</view>
				<view class="icon"><text class="iconfont icon-yundong"></text></view>
				<view class="step-number">
					<text class="number">{{ item.stepNum }}</text>
					<text class="unit">步</text>
				</view>
				<view class="calorie">
					<text class="number">{{ item.calorie }}</text>
					<text class="unit">千卡</text>
				</view>
			</view> -->
		</view>
	</view>
</template>

<script>
import 'static/icon/health/font/iconfont.css';
export default {
	data() {
		return {
			date: '',
			stepRecord: [
				{
					date: '2020-08-13',
					stepNum: '6741',
					calorie: '237'
				},
				{
					date: '2020-08-12',
					stepNum: '7413',
					calorie: '366'
				},
				{
					date: '2020-08-11',
					stepNum: '5521',
					calorie: '201'
				},
				{
					date: '2020-08-10',
					stepNum: '9845',
					calorie: '531'
				},
				{
					date: '2020-08-09',
					stepNum: '7531',
					calorie: '351'
				},
				{
					date: '2020-08-08',
					stepNum: '6741',
					calorie: '237'
				}
			]
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
		if (option.title) {
			uni.setNavigationBarTitle({
				title: option.title
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.sport-wrap {
	background-color: #f1f1f1;
	height: 100vh;
	overflow: scroll;
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
			.title {
				font-size: 20rpx;
				color: #999;
			}
			.status {
				display: flex;
				justify-content: space-between;
				min-height: 100rpx;
				align-items: center;
				.tag {
					border-radius: 15rpx;
					padding: 5rpx 10rpx;
				}
				.value {
					font-size: 36rpx;
					font-weight: bold;
					.unit {
						font-size: 20rpx;
					}
				}
			}
		}
	}
	.foot-record {
		display: flex;
		flex-direction: column;
		margin: 20rpx;
		.title {
			line-height: 50rpx;
			font-weight: bold;
			text-indent: 10rpx;
		}
		.record-item {
			background-color: #fff;
			border-radius: 20rpx;
			margin: 5rpx 20rpx;
			min-height: 120rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20rpx;
			.icon {
				color: #18b566;
				margin: 0 20rpx;
				.iconfont {
					font-size: 50rpx;
				}
			}
			.step-number,
			.calorie {
				font-weight: bold;
				font-size: 40rpx;
				padding: 0 30rpx;
				.unit {
					font-size: 20rpx;
				}
			}
		}
	}
}
</style>
