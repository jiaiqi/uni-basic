<template>
	<view class="health-wrap" @click="clickPage">
		<u-navbar back-text="返回" :back-text-style="backTextStyle" :back-icon-color="backTextStyle.color" :is-back="false" :background="navBackground">
			<view class="header-wrap">
				<view class="title">{{ pageTitle }}</view>
				<view class="user-info" @click.stop="showUserList = !showUserList">
					<u-avatar :src="src" mode="circle" :size="60"></u-avatar>
					<view class="user-name" data-event="showUserList">
						<text class="text" data-event="showUserList">{{ userInfo.name }}</text>
						<!-- <u-icon name="play-left-fill" color="#333" size="28" :class="{ active: showUserList }"></u-icon> -->
						<u-icon name="arrow-down-fill" color="#333" size="28" :class="{ active: showUserList }"></u-icon>
					</view>
					<view class="user-list" :class="{ active: showUserList }" @click.stop="clickUserList"><view class="user">hahaha</view></view>
				</view>
			</view>
		</u-navbar>
		<view class="content-wrap">
			<view class="top">
				<view class="prompt">永远相信美好的事情即将发生</view>
				<!-- 		<view class="date">
					<text class="u-margin-10">{{ date }}</text>
				
				</view> -->
				<picker class="date-picker" mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
					<view class="uni-input">
						<text class="u-margin-10">{{ date }}</text>
						<u-icon name="arrow-down-fill" color="#333" size="28"></u-icon>
					</view>
				</picker>
			</view>
			<view class="content" v-for="(content, contentIndex) in contentList" :key="contentIndex">
				<view class="title">{{ content.title }}</view>
				<view class="content-item" v-for="(item, itemIndex) in content.list" :key="itemIndex" @click="toRelationPage">{{ item }}</view>
			</view>
			<!-- 			<view class="contetn-item"><view class="title">疾病</view></view>
			<view class="contetn-item"><view class="title">病因</view></view> -->
		</view>
	</view>
</template>

<script>
import formateDate from '@/common/js/function/formatDate.js';
export default {
	data() {
		return {
			pageTitle: '健康状况',
			showUserList: false,
			date: '',
			backTextStyle: {
				color: '#333'
			},
			src: 'http://pic2.sc.chinaz.com/Files/pic/pic9/202002/hpic2119_s.jpg',
			navBackground: {
				backgroundColor: '#fff'
			},
			userInfo: { name: 'jiaqi' },
			contentList: [
				{
					title: '病因',
					list: ['烟酒', '饮食', '生活习惯', '家族史', '心理因素', '环境因素']
				},
				{
					title: '病症',
					list: ['咳嗽', '极度口渴', '心跳过快', '头痛', '胸闷', '气短', '胃痛']
				},
				{
					title: '疾病',
					list: ['急性咽喉炎', '支气管炎', '肺结核', '高血糖', '低血压', '颈性偏头痛', '胰腺炎', '十二指肠溃疡']
				}
			]
		};
	},
	created() {
		this.date = formateDate(new Date(), '年月日');
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
		toRelationPage(e){
			uni.navigateTo({
				url:'relation/relation'
			})
		},
		bindDateChange(e) {
			console.log(e);
		},
		clickPage(e) {
			if (this.showUserList) {
				this.showUserList = false;
			}
		},
		clickUserList(e) {
			console.log(e);
		},
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
	}
};
</script>

<style lang="scss" scoped>
.health-wrap {
	background-color: #f1f1f1;
	height: 100vh;
	overflow-y: scroll;
}
.header-wrap {
	// 顶部导航栏
	color: #333;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex: 1;
	padding: 0 30rpx;
	.title {
		// 顶部标题
		font-weight: 700;
	}
	.user-info {
		display: flex;
		align-items: center;
		position: relative;
		.user-name {
			min-width: 100rpx;
			// padding: 0 10rpx;
			display: flex;
			.text {
				padding: 0 10rpx 0 20rpx;
			}
			.u-icon {
				transition: all 0.5s;
				&.active {
					transform: rotate(90deg);
				}
			}
		}
		.user-list {
			position: absolute;
			box-sizing: border-box;
			width: 150rpx;
			height: 0;
			border-radius: 10rpx;
			right: 0;
			bottom: -10rpx;
			opacify: 0;
			transition: all 0.5s;
			overflow: hidden;
			background-color: #fff;
			&.active {
				border: 1px solid #ddd;
				opacify: 1;
				height: 300rpx;
				bottom: -310rpx;
				z-index: 999;
			}
			.user {
				width: 100%;
				height: 50rpx;
				padding: 5rpx;
				text-align: center;
				display: flex;
				align-items: center;
				justify-content: center;
				border-bottom: 1rpx solid #fff;
			}
		}
	}
}
.content-wrap {
	// 内容区域
	display: flex;
	flex-direction: column;
	// background-color: #fff;
	padding: 20rpx 0;
	.top {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #fff;
		// justify-content: center;
		padding: 20rpx 30rpx 0;
		.prompt {
			// 提示语
			width: 100%;
			border-radius: 20rpx;
			// border: 1rpx solid #c8c9cc;
			background-color: #f4f4f5;
			height: 200rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.date-picker {
			margin: 10rpx 0;
			color: #999;
			// font-weight: 700;
		}
	}
	.content {
		background-color: #fff;
		padding: 20rpx;
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
		.title {
			font-weight: 700;
			width: 100%;
		}
		.content-item {
			min-height: 150rpx;
			width: calc(33.333% - 20rpx);
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #f1f1f1;
			margin:10rpx;
			border-radius: 10rpx;
			padding: 10rpx;
		}
	}
}
</style>
