<template>
	<view class="merchant-list">
		<!-- <u-navbar title="优惠券核销记录"  :is-back="false" :title-color="'#fff'" :background="background"></u-navbar> -->
		
		<bx-new-list class="bx-list" v-slot:listItem="{ data }" :srvInfo="srvInfo" @getRowButton="getRowButton" ref="bxList">
			<view class="list-item">
				<view class="carrier">
					<view class="left">
						<view class="title">{{ data.coupon_name }}</view>
						<view class="term">
							<view class="term_time">消费者：{{ data.usedUserInfo.name }}</view>
							<view class="term_time">核销人：{{ data.confirmUserInfo.real_name }}</view>
							<view style="margin-bottom: 2px;" class="term_time">核销时间：{{ data.confirm_time }}</view>
						</view>
						<view class="gap-top"></view>
						<view class="gap-bottom"></view>
					</view>
					<view class="right">
						<view class="ticket">
							<view class="num">{{ data.used_amount }}</view>
							<view class="unit">元</view>
						</view>
					</view>
				</view>
			</view>
		</bx-new-list>
	</view>
</template>

<script>
export default {
	data() {
		return {
			background: {
				backgroundColor: '#ec625c'
			
				// 导航栏背景图
				// background: 'url(https://cdn.uviewui.com/uview/swiper/1.jpg) no-repeat',
				// 还可以设置背景图size属性
				// backgroundSize: 'cover',
			
				// 渐变色
				// backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
			},
			srvInfo: {
				serviceName: 'srvspocp_coupon_audit_market',
				app: 'spocp',
				rownumber: 10
			},
			rowButtons: []
		};
	},
	onLoad() {
		// this.getCouponUsedList()
	},
	methods: {
		async getCouponUsedList(){
			const url = this.getServiceUrl('spocp','srvspocp_coupon_audit_market','select')
			const req = {
				serviceName:'srvspocp_coupon_audit_market',
				"colNames": ["*"],
				condition:[]
			}
			let res = await this.$http.post(url.req).then(res=>{
				console.log("优惠券核销列表",res)
			})
		},
		getRowButton(e) {
			this.rowButtons = e;
		}
	}
};
</script>

<style lang="scss" scoped>
.no-data{
	height: calc(100vh - 100rpx);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	image{
		width: 100rpx;
		height: 100rpx;
	}
	.none_text{
		color: #CCCCCC;
		margin-top: 10rpx;
	}
}
.merchant-list {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #f1f1f1;
	.bx-list {
		height: calc(100vh -88rpx);
		.list-item {
			width: calc(100% - 40rpx);
			margin: 20upx auto 0;
			// border-radius: 10rpx;
			overflow: hidden;
			// background-color: #fff;
			display: flex;
			flex-direction: column;
			.content-box {
				padding-top: 20rpx;
				.title {
					padding: 10rpx 20rpx;
					.lable {
						color: #333;
						margin-right: 10rpx;
					}
					.value {
						color: #000;
						font-weight: bold;
					}
				}
				.content {
					display: flex;
					padding: 10rpx 20rpx;
					justify-content: space-between;
					flex-wrap: wrap;
					.content-item {
						min-width: 40%;
						.label {
							color: #333;
							display: inline-block;
							padding-right: 10rpx;
						}
						.value {
							color: #000;
							font-weight: bold;
						}
					}
				}
			}
			.button-box {
				border-top: dashed #f1f1f1 1px;
				display: flex;
				padding: 20rpx 0;
				flex-wrap: wrap;
				width: 100%;
				justify-content: flex-end;
				.content-item {
					padding: 0 20rpx;
					.label {
						color: #333;
						display: inline-block;
						padding-right: 10rpx;
					}
					.value {
						// color: #000;
						font-weight: bold;
					}
				}
				.buttons {
					display: flex;
					flex: 1;
					display: flex;
					flex-wrap: wrap;
					justify-content: flex-end;
					.u-btn {
						height: 50rpx;
						margin-right: 10rpx;
						margin-left: 0;
						// padding: 0 20rpx;
					}
				}
			}
			.carrier {
				display: flex;
				background-color: white;
				justify-content: space-around;
				margin-bottom: 15px;
				.left {
					width: 70%;
					display: flex;
					flex-direction: column;
					.title {
						padding-top: 3vw;
						width: 90%;
						margin: 0 5%;
						font-size: 17px;
					}
					.term {
						width: 90%;
						margin: 15px 5%;
						font-size: 12px;
						color: #999;
						display: flex;
						flex-wrap: wrap;
						justify-content: space-between;
						.term_time{
							padding: 5rpx 0;
						}
					}
					position: relative;
					.gap-top,
					.gap-bottom {
						position: absolute;
						width: 20upx;
						height: 20upx;
						right: -18upx;
						border-radius: 100%;
						background-color: #f5f5f5;
					}
					.gap-top {
						top: -10upx;
					}
					.gap-bottom {
						bottom: -10upx;
					}
					.shixiao {
						position: absolute;
						right: 0px;
						font-size: 150upx;
						z-index: 6;
						color: rgba(153, 153, 153, 0.2);
						width: 60px;
						height: 60px;
						image {
							width: 100%;
							height: 100%;
						}
					}
					.un-use {
						right: 3px;
						top: 10px;
						width: 60px;
						height: 60px;
						.lose {
							image {
								width: 100%;
								height: 100%;
							}
						}
					}
				}
				.right {
					width: 28%;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					color: white;
					align-items: center;
					background: linear-gradient(to right, #ec625c, #ee827f);
					.ticket {
						display: flex;
						align-items: center;
						.num {
							font-size: 20px;
							font-weight: 600;
						}
						.unit {
							font-size: 12px;
						}
					}
					.use {
						height: 20px;
						border-radius: 10px;
						background: white;
						color: #ee827f;
						padding: 2px 10px;
						font-size: 12px;
					}
				}
				.is-lose {
					background: linear-gradient(to right, #aaa, #999);
					.use {
						color: #aaa;
					}
				}
				.is-use {
					background: linear-gradient(to right, #aaa, #999);
					.use {
						color: #aaa;
					}
				}
			}
		}
	}
}
</style>
