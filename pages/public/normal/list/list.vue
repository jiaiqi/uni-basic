<template>
	<view class="list">
		<bx-list class="list-wrap">
			<view class="list-item" slot="list-item" slot-scope="item">
				<view class="title">
					标题
				</view>
				<view class="content">
					
				</view>
				{{item.data}}
			</view>
		</bx-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss" scoped>
.record{
	width: 100%;
	min-height: 100vh;
	background-color: #f1f1f1;
}
.list-item{
	background-color: #fff;
	border-radius: 20rpx;
	margin: 10rpx 20rpx;
	padding:10rpx 20rpx;
	min-height: 200rpx;
	display: flex;
	flex-direction: column;
	.title{
		border-bottom: 1rpx solid #f1f1f1;
		height: 50rpx;
	}
	.content{
		padding: 10rpx 0;
	}
}
</style>
