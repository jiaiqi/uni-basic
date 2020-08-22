<template>
	<view class="merchant-list">
		<u-navbar title="优惠券核销记录"  :is-back="false" :title-color="'#fff'" :background="background"></u-navbar>
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
						<view class="icon shixiao" :class="TabCur == 3 ? 'un-use' : ''">
							<image class="lose" v-if="TabCur == 3" src="../../../static/img/lose.png" mode=""></image>
							<image v-if="TabCur == 2" src="../../../static/img/use.png" mode=""></image>
						</view>
						<view class="gap-top"></view>
						<view class="gap-bottom"></view>
					</view>
				
					<view class="right" :class="isLose ? 'is-lose' : isUse ? 'is-use' : ''">
						<view class="ticket">
							<view class="num">{{ data.used_amount }}</view>
							<view class="unit">元</view>
						</view>
						<!-- <view class="criteria">满{{ data.consume_amount }}使用</view> -->
					</view>
				</view>
			<!-- 	<view class="content-box">
					<view class="title">
						<text class="label">优惠券名称:</text>
						<text class="value">{{ data.coupon_name }}</text>
					</view>
					<view class="content">
						<view class="content-item">
							<text class="label">使用者:</text>
							<text class="value">{{ data.usedUserInfo.name }}</text>
						</view>
						<view class="content-item">
							<text class="label">核销人：</text>
							<text class="value">{{ data.confirmUserInfo.real_name }}</text>
						</view>
						<view class="content-item">
							<text class="label">核销时间</text>
							<text class="value">{{ data.confirm_time }}</text>
						</view>
					</view>
				</view> -->
				<!-- 	<view class="button-box">
					<view class="content-item">
						<text class="label">{{ data.status.label }}:</text>
						<text class="value" :class="{'text-red':data.status&&data.status.value==='未确认','text-green':data.status&&data.status.value==='已确认'}">{{ data.status.value }}</text>
					</view>
					<view class="buttons">
						<u-button type="primary" v-if="data.status.value != '已确认'" @click="changeStatus(data)">确认</u-button>
						<u-button type="error" @click="deletePeople(data)">删除</u-button>
					</view>
				</view> -->
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
	created() {},
	mounted() {},
	methods: {
		deletePeople(e) {
			if (e.id && (e.id.value || e.id.value === 0)) {
				let url = this.getServiceUrl(this.srvInfo.app, 'srvspocp_merchant_owner_delete', 'operate');
				let req = [
					{
						serviceName: 'srvspocp_merchant_owner_delete',
						condition: [
							{
								colName: 'id',
								ruleType: 'eq',
								value: e.id.value
							}
						]
					}
				];
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						this.$refs.bxList.refresh();
					} else {
						uni.showToast({
							title: res.data.resultMessage
						});
					}
				});
			}
		},
		changeStatus(e) {
			// 改变商户状态 无效/已确认
			if (e.id && (e.id.value || e.id.value === 0)) {
				let url = '';
				let req = [];
				if (e.status.value === '无效' || e.status.value === '未确认') {
					url = this.getServiceUrl(this.srvInfo.app, 'srvspocp_merchant_owner_confirm', 'operate');
					req = [
						{
							serviceName: 'srvspocp_merchant_owner_confirm',
							condition: [
								{
									colName: 'id',
									ruleType: 'eq',
									value: e.id.value
								}
							]
						}
					];
				} else if (e.status.value === '已确认') {
					url = this.getServiceUrl(this.srvInfo.app, 'srvspocp_merchant_status_invalid_update', 'operate');
					// srvspocp_merchant_status_invalid_update
					req = [
						{
							srvApp: 'spocp',
							serviceName: 'srvspocp_merchant_status_invalid_update',
							condition: [
								{
									colName: 'id',
									ruleType: 'eq',
									value: e.id.value
								}
							]
						}
					];
				} else {
					uni.showToast({
						title: '无效操作',
						icon: 'none'
					});
					return;
				}
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						uni.showToast({
							title: '操作成功',
							icon: 'none'
						});
						this.$refs.bxList.refresh();
					} else {
						uni.showToast({
							title: res.data.resultMessage,
							icon: 'none'
						});
					}
				});
			}
		},
		getRowButton(e) {
			this.rowButtons = e;
		}
	}
};
</script>

<style lang="scss" scoped>
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
