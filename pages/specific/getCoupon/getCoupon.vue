<template>
	<view class="coupon_wrap">
		<view class="coupon_top">
			<view class="coupon_top_title">
				<image src="../../../static/logo.png" mode=""></image>
				<text>宝塔区</text>
			</view>
			<view class="coupon_main">
				<view class="coupon_main_top">
					<view class="coupon_main_top_text">
						<text>50元</text>
						<text>代金券</text>
					</view>
					<view class="coupon_main_top_free">免费</view>
					<view class="coupon_main_top_get">
						领取
					</view>
				</view>
				<view class="coupon_main_bot">
					<view class="coupon_main_bot_time">
						<view class="coupon_main_bot_time_left">
							可用时间：
						</view>
						<view class="">
							2020-08-18 ~ 2020-08-20
						</view>
					</view>
					<view class="coupon_main_bot_cond">
						<view class="coupon_main_bot_cond_left">
							使用条件：
						</view>
						<view class="">
							景区消费满100元可用
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:'getCoupon',
		data(){
			return {
				
			}
		},
		
	}
</script>

<style scoped lang="scss">
	.coupon_wrap{
		width: 100%;
		height: 100vh;
		background: #6482c2;
		display: flex;
		align-items: center;
		justify-content: center;
		.coupon_top{
			display: flex;
			justify-content: center;
			align-items: center;
			padding-top: 10px;
			flex-direction: column;
			width: 100%;
			.coupon_top_title{
				display: flex;
				border-radius: 10px;
				background: white;
				width: 90%;
				padding: 20px;
				image{
					width: 45px;
					height: 45px;
					border-radius: 50%;
					margin-right: 8px;
				}
			}
			.coupon_main{
				width: 90%;
				border-radius: 10px;
				background: white;
				display: flex;
				justify-content: center;
				flex-direction: column;
				border-top: 1px dashed #CCCCCC;
				.coupon_main_top{
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					height: 150px;
					width: 100%;
					align-items: center;
					.coupon_main_top_text{
						text{
							font-size: 20px;
						}
					}
					.coupon_main_top_free{
						color: red;
						font-size: 16px;
						text-align: center;
					}
					.coupon_main_top_get{
						text-align: center;
						background: #e6605f;
						padding: 10px 60px;
						color: white;
						font-size: 14px;
						border-radius: 20px;
					}
				}
				.coupon_main_bot{
					padding: 20px 10px;
					margin-top: 15px;
					
					.coupon_main_bot_time{
						display: flex;
						align-items: center;
						font-size: 14px;
						margin-bottom: 10px;
					}
					.coupon_main_bot_cond{
						display: flex;
						align-items: center;
						font-size: 14px;
					}
				}
				
			}
		}
	}
</style>
