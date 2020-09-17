<template>
	<view class="wrap-content">
		<view class=" switch-menu">
			<view class="boxshow">
				<view class="menu" :style="{color:(idxMenu==index?'#3e3e3e':''),'fontSize':(idxMenu==index?'16px':'')}" v-for="(item,index) in menuList"
				 @click="switchover(item,index)">{{item.title}}</view>
			</view>
		</view>
		<view class="placeholder"></view>
		<view class="list-wrap" >
			<s-pull-scroll ref="pullScroll" :back-top="true" :pullDown="pullDown" :top="'112'" :pullUp="loadData">
				<view class="card_box" v-for="(item,i) in listContent" :key="i">
					<view class="name">
						<view class="namet">景点名称</view>
						<text class="identification" :style="{background:item.reserve_status=='已预约'?'#28d322':'#bdbfbc'}"></text>
					</view>
					<view class="arer-box">
						<view class="title">{{item.scenic_name}}</view>
						<view class="time">预约时间：{{item.reserve_time}}</view>
					</view>
					<view class="number">预约号：{{item.reserve_no}}</view>
				</view>
			</s-pull-scroll>
		</view>
		<view class="normal" v-if="isShowimg">
			<image src="../../../static/img/orderselece.png" mode=""></image>
		</view>
	</view>
</template>

<script>
	import sPullScroll from '@/components/s-pull-scroll/index.vue'
	export default {
		components: {
			sPullScroll
		},
		data() {
			return {
				menuList: [{
						title: '已预约'
					},
					{
						title: '已取消'
					},
				],
				idxMenu: 0,
				pageInfo: {
					pageNo: 1,
					rownumber: 10,
					total: 0,
				},
				listContent: [],
				normalStatus: '已预约',
				isShowimg:false
			}
		},
		methods: {
			loadData() {
				this.pageInfo.pageNo++;
				setTimeout(() => {
					this.getData(this.normalStatus).then(() => {})
				}, 1000)
			},
			async getData(val) {
				const url = this.getServiceUrl('spocp', 'srvspocp_user_reserve_record_select', 'select');
				const req = {
					serviceName: 'srvspocp_user_reserve_record_select',
					colNames: ['*'],
					condition: [{
						"colName": "reserve_status",
						"ruleType": "eq",
						"value": val // 预约状态    已预约，已取消
					}],
					page: {
						pageNo: this.pageInfo.pageNo,
						rownumber: this.pageInfo.rownumber,
					}
				}

				let res = await this.$http.post(url, req);
				let yearDatas = res.data.data
				this.pageInfo = res.data.page
				let page = this.pageInfo;
				if (this.pageInfo.pageNo == 1) {
					this.listContent = yearDatas
				} else {
					this.listContent = this.listContent.concat(yearDatas)
				}
				this.listContent.length==0?(this.isShowimg=true):(this.isShowimg=false)
				if (page.rownumber * page.pageNo >= page.total) {
					this.$refs.pullScroll.finish();
				} else {
					this.$refs.pullScroll.success();
				}

			},
			pullDown() {
				this.pageInfo.pageNo = 1;
				setTimeout(() => {
					this.getData(this.normalStatus)
				}, 500)
			},
			switchover(val, index) {
				this.idxMenu = index;
				this.isShowimg=false
				this.pageInfo.pageNo = 1;
				this.normalStatus = val.title
				this.listContent = []
				this.$refs.pullScroll.showDownLoading();
				setTimeout(() => {
					this.getData(val.title).then(() => {
						this.$refs.pullScroll.hideDownLoading();
					})
				}, 500)
			},
		},
		created() {
			this.selectRealNameInfo()
		},
		onLoad() {
			this.$nextTick(() => {
				this.$refs.pullScroll.refresh();
			});
		}
	}
</script>

<style lang="scss" scoped>
	.wrap-content {
		background-color: #f4f6fa;
		min-height: 100vh;
		position: relative;
		.list-wrap {
			.card_box {
				padding: 0 45upx;
				background-color: #fff;
				color: #bdb7b7;
				font-size: 28upx;
				margin-bottom: 40upx;

				.name {
					border-bottom: 1upx solid #EEEEEE;
					display: flex;
					align-items: center;
					padding: 10upx 0;

					.namet {
						color: #77818c;
					}

					.identification {
						display: inline-block;
						width: 28upx;
						height: 28upx;
						border-radius: 50%;
						margin-left: 55upx;
					}
				}

				.arer-box {
					padding: 10upx 0;
					border-bottom: 1upx solid #EEEEEE;

					.title {
						font-size: 32upx;
						color: #505050;
						margin-bottom: 20upx;
					}
				}

				.number {
					padding: 20upx 0 15upx 0;
				}
			}
		}

		.placeholder {
			height: 112upx;
		}

		.switch-menu {
			padding: 40upx;
			padding-bottom: 30upx;
			background-color: #f4f6fa;
			position: fixed;
			top: 0;
			width: 100%;
			z-index: 999;

			.boxshow {
				display: flex;
				align-items: flex-end;

				.menu {
					margin-right: 50upx;
					color: #a2a2a2;
				}
			}
		}
	}
	.normal{
		position: absolute;
		bottom: 0;
		z-index: 999;
		image{
			display: block;
			height: 75vh;
			width: 100vw;
		}
	}
	/deep/ .uni-scroll-view-content{
		background-color: #f4f6fa;
	}
</style>
