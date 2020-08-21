<template>
	<view class="merchant-list">
		<bx-list class="bx-list" v-slot:listItem="{ data }" :srvInfo="srvInfo" @getRowButton="getRowButton" ref="bxList">
			<view class="list-item">
				<view class="content-box">
					<view class="title">
						<!-- <text class="label">{{ data.name.label }}:</text> -->
						<text class="value">{{ data.name.value }}</text>
					</view>
					<view class="content">
						<view class="content-item">
							<text class="label">{{ data.merchant_name.label }}:</text>
							<text class="value">{{ data.merchant_name.value }}</text>
						</view>
						<view class="content-item">
							<text class="label">{{ data.mobile.label }}:</text>
							<text class="value">{{ data.mobile.value }}</text>
						</view>

						<view class="content-item">
							<text class="label">{{ data.id_card.label }}:</text>
							<text class="value">{{ data.id_card.value }}</text>
						</view>
					</view>
				</view>
				<view class="button-box">
					<view class="content-item">
						<text class="label">{{ data.status.label }}:</text>
						<text class="value" :class="{'text-red':data.status&&data.status.value==='未确认','text-green':data.status&&data.status.value==='已确认'}">{{ data.status.value }}</text>
					</view>
					<!-- <u-button type="warning" v-if="data.status.value != '无效'" @click="changeStatus(data)">无效</u-button> -->
					<view class="buttons">
						<u-button type="primary" v-if="data.status.value != '已确认'" @click="changeStatus(data)">确认</u-button>
						<u-button type="error" @click="deletePeople(data)">删除</u-button>
					</view>
				</view>
			</view>
		</bx-list>
	</view>
</template>

<script>
export default {
	data() {
		return {
			srvInfo: {
				serviceName: 'srvspocp_merchant_user_info_select',
				app: 'spocp',
				rownumber: 10
			},
			rowButtons: []
		};
	},
	created() {
		
	},
	mounted() {
	},
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
		height: calc(100vh - 20rpx);
		.list-item {
			width: calc(100% - 40rpx);
			margin: 20upx auto 0;
			border-radius: 10rpx;
			overflow: hidden;
			background-color: #fff;
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
		}
	}
}
</style>
