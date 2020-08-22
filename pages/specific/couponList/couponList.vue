<template>
	<view class="coupon-list-wrap" v-if="req.serviceName">
		<u-navbar title="优惠券列表" :back-icon-color="backIcon" :is-back="false" :back-text-style="backText" :title-color="color" :background="background"></u-navbar>
		<view class="coupon-list-tab">
			<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
				<view class="flex text-center">
					<view class="cu-item flex-sub" :class="index == TabCur ? 'text-orange cur' : ''" v-for="(item, index) in tabData" :key="index" @tap="tabSelect" :data-id="index">
						{{ item.label }}
					</view>
				</view>
			</scroll-view>
		</view>
		<sPullScroll
			ref="pullScroll"
			:heightStyle="heightStyle"
			:pullDown="pullDown"
			:pullUp="loadData"
			:enablePullDown="true"
			:enablePullUp="true"
			:top="185"
			:fixed="true"
			:bottom="0"
			finishText="我是有底线的..."
		>
			<view v-if="couponValidList.length > 0" class="coupon-list-main">
				<view class="row">
					<view v-for="(item, index) in couponValidList" class="carrier" :key="index" @click="handleClick(item)">
						<view class="left">
							<view class="title">{{ item.coupon_name }}</view>
							<view class="term">
								<view style="margin-bottom: 2px;" class="term_time">使用时间：{{ item.used_start_time }}</view>
								<view class="term_time">过期时间：{{ item.used_end_time }}</view>
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
								<view class="num">{{ item.used_amount }}</view>
								<view class="unit">元</view>
							</view>
							<view class="criteria">满{{ item.consume_amount }}使用</view>
							<view @click="toUse(item)" v-if="TabCur == 1" class="use">去使用</view>
							<view v-if="TabCur == 2" class="use">已使用</view>
							<view @click="drawCoupon(item)" v-if="TabCur == 0" class="use">领取</view>
						</view>
					</view>
				</view>
			</view>
		</sPullScroll>
		<view v-if="isShopOwner" class="public-button-box"><view @click="toScan" class="lg text-gray cuIcon-scan add-button"></view></view>
	</view>
</template>

<script>
import sPullScroll from '@/components/s-pull-scroll';
export default {
	name: 'couponList',
	components: { sPullScroll },
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
			pageInfo: {
				total: 0,
				rownumber: 5,
				pageNo: 1
			},
			req: {
				serviceName: '',
				cond: []
			},
			color: '#fff',
			backIcon: '#fff',
			heightStyle: 'calc(100vh-200upx)',
			backText: { color: '#fff' },
			isShopOwner: false,
			tabData: [
				{
					label: '可领取',
					value: 0
				},
				{
					label: '未使用',
					value: 1
				},
				{
					label: '已使用',
					value: 2
				},
				{
					label: '已失效',
					value: 3
				}
			],
			isLose: false,
			isUse: false,
			TabCur: 0,
			scrollLeft: 0,
			couponValidList: [
				// {id:1,title:"日常用品立减10元",termStart:"2019-04-01",termEnd:"2019-05-30",ticket:"10",criteria:"满50使用"},
				// {id:2,title:"家用电器立减100元",termStart:"2019-04-01",termEnd:"2019-05-30",ticket:"100",criteria:"满500使用"},
				// {id:3,title:"全场立减10元",termStart:"2019-04-01",termEnd:"2019-05-30",ticket:"10",criteria:"无门槛"},
				// {id:4,title:"全场立减50元",termStart:"2019-04-01",termEnd:"2019-05-30",ticket:"50",criteria:"满1000使用"}
			],
			couponinvalidList: [
				{ id: 1, title: '日常用品立减10元', termStart: '2019-04-01', termEnd: '2019-05-30', ticket: '10', criteria: '满50使用' },
				{ id: 2, title: '家用电器立减100元', termStart: '2019-04-01', termEnd: '2019-05-30', ticket: '100', criteria: '满500使用' },
				{ id: 3, title: '全场立减10元', termStart: '2019-04-01', termEnd: '2019-05-30', ticket: '10', criteria: '无门槛' },
				{ id: 4, title: '全场立减50元', termStart: '2019-04-01', termEnd: '2019-05-30', ticket: '50', criteria: '满1000使用' }
			]
		};
	},
	onPageScroll(e) {},
	//下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
	onPullDownRefresh() {
		setTimeout(function() {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	onLoad() {
		this.selectRealNameInfo().then(res=>{
			if(res.status==='success'){
				// 已经注册
				this.getSignature();
				let serviceName = 'srvspocp_coupon_config_receive_select';
				let cond = [
					{
						colName: 'view_give_status',
						ruleType: 'eq',
						value: '已发放'
					},
					{
						colName: 'status',
						ruleType: 'eq',
						value: '有效'
					},
					{
						colName: 'user_no',
						ruleType: 'eq',
						value: uni.getStorageSync('login_user_info').user_no
					}
				];
				this.req.serviceName = serviceName;
				this.req.cond = cond;
				this.getShopUserInfo();
				this.onRefresh();
			}
		})
	},
	methods: {
		handleClick(item){
			// 点击优惠券 判断是领取还是使用
			if(this.TabCur === '1'){
				// 去使用
				this.toUse(item)
			}else if(this.TabCur===0){
				// 领取
				this.drawCoupon(item)
			}
		},
		pullDown(pullScroll) {
			console.log(pullScroll.page);
			let page = this.pageInfo;
			this.pageInfo.pageNo = 1;
			let self = this;
			setTimeout(() => {
				self.getDrawCoupon(self.req.serviceName, self.req.cond).then(callBackData => {
					// if (callBackData.page.rownumber * callBackData.page.pageNo >= callBackData.page.total) {
					// 	// finish(boolean:是否显示finishText,默认显示)
					// 	self.$refs.pullScroll.finish();
					// } else {
					// 	self.$refs.pullScroll.success();
					// }
				});
				// this.loadData(pullScroll);
			}, 200);
		},
		loadData(pullScroll) {
			console.log('上拉加载');
			let page = this.pageInfo;
			this.pageInfo.pageNo = pullScroll.page;
			console.log(pullScroll.page);
			this.getDrawCoupon(this.req.serviceName, this.req.cond);
			// if (page.rownumber * page.pageNo >= page.total) {
			// 	// finish(boolean:是否显示finishText,默认显示)
			// 	pullScroll.finish();
			// } else {
			// 	pullScroll.success();
			// }
			// });
		},
		/* 使用优惠券**/
		toUse(couponItem) {
			console.log('去使用', couponItem);
			uni.navigateTo({
				url: '/pages/specific/couponUsage/couponUsage?couponItem=' + encodeURIComponent(JSON.stringify(couponItem))
			});
		},
		/* 获取可领取得优惠券**/
		async getDrawCoupon(serviceName, cond) {
			let self = this;
			const url = this.getServiceUrl('spocp', serviceName, 'select');
			const req = {
				serviceName: serviceName,
				colNames: ['*'],
				condition: cond,
				page: {
					rownumber: this.pageInfo.rownumber,
					pageNo: this.pageInfo.pageNo
				}
			};
			let res = await this.$http.post(url, req);
			let couponData = res.data.data;
			// if(serviceName === 'srvspocp_coupon_config_receive_select'){
			// 	let date = new Date().getTime()
			// 	let allowCouponData = []
			// 	// couponData.forEach(item=>{
			// 	// 	let itemDateTime = new Date(item.end_time).getTime( )
			// 	// 	console.log('itemDateTime',itemDateTime)
			// 	// 	if(date <= item.itemDateTime){
			// 	// 		allowCouponData.push(item)
			// 	// 	}
			// 	// })
			// 	// console.log("可领取得优惠券---去除领取截止时间小于当前时间",allowCouponData,date)
			// }
			console.log('获取到可领取得优惠券列表', res);
			if (this.pageInfo.pageNo === 1) {
				self.couponValidList = [];
			}
			self.pageInfo.total = res.data.page.total;
			self.pageInfo.pageNo = res.data.page.pageNo;
			let page = self.pageInfo;
			if (page.rownumber * page.pageNo >= page.total) {
				// finish(boolean:是否显示finishText,默认显示)
				self.$refs.pullScroll.finish();
			} else {
				self.$refs.pullScroll.success();
			}
			this.couponValidList = this.couponValidList.concat(res.data.data);
		},
		/* 查询商户信息**/
		async getShopUserInfo() {
			let self = this;
			let realNameInfo = uni.getStorageSync('realNameInfo');
			if (realNameInfo.status === 'success' && realNameInfo._merchant_user && realNameInfo._merchant_user.status === '已确认') {
				self.isShopOwner = true;
			} else {
				self.isShopOwner = false;
			}
			// const url = this.getServiceUrl('spocp', 'srvspocp_merchant_name_select', 'select');
			// const req = {
			// 	serviceName: 'srvspocp_merchant_name_select',
			// 	colNames: ['*'],
			// 	condition: [
			// 		]
			// };
			// let res = await this.$http.post(url,req)
			// if(res.data.data.length > 0){
			// 	this.isShopOwner = true
			// }
		},
		/* 领取优惠券**/
		async drawCoupon(couponItem) {
			uni.showLoading({
				title: '加载中'
			});
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_get', 'operate');
			const req = [
				{
					serviceName: 'srvspocp_coupon_get',
					colNames: ['*'],
					condition: [
						{
							colName: 'coupon_no',
							ruleType: 'eq',
							value: couponItem.coupon_no
						}
					]
				}
			];
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				uni.hideLoading();
				uni.showToast({
					title: '领取成功',
					duration: 2000
				});
				setTimeout(() => [this.onRefresh()], 500);
			} else {
				uni.showToast({
					title: res.data.resultMessage,
					icon: 'none'
				});
			}
			// console.log('优惠券领取----',res)
			// setTimeout(()=>{

			// },2000)

			// const url = this.getServiceUrl('spocp', 'srvspocp_qr_code_create', 'select');
			// const req = [{
			// 	serviceName: 'srvspocp_qr_code_create',
			// 	colNames: ['*'],
			// 	condition: [{ colName: 'coupon_no', ruleType: 'eq', value: couponItem.coupon_no }]
			// }];
			// let res = await this.$http.post(url,req)

			console.log('领取优惠券', couponItem);
		},
		/*注入接口权限**/
		getSignature(formData) {
			let self = this;
			let linkurl = window.location.href.split('#')[0];
			let req = {
				serviceName: 'srvwx_app_signature_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'app_no',
						ruleType: 'eq',
						value: this.$api.appNo.wxh5
					},
					{
						colName: 'page_url',
						ruleType: 'eq',
						value: linkurl
						// value: uni.getStorageSync('linkUrl') ? uni.getStorageSync('linkUrl') : window.location.href.split('#')[0]
					}
				]
			};
			self.$http.post(self.$api.getSignature, req).then(res => {
				if (res.data.state === 'SUCCESS') {
					let resData = res.data.data[0];
					console.log('getSignature', resData);
					jweixin.config({
						debug: false, // 调试阶段建议开启
						appId: resData.appId, // APPID
						timestamp: resData.timestamp, // 时间戳timestamp
						nonceStr: resData.noncestr, // 随机数nonceStr
						signature: resData.signature, // 签名signature
						// 需要调用的方法接口
						jsApiList: ['scanQRCode']
					});
					jweixin.ready(() => {});
					jweixin.error(function(res) {
						// alert(JSON.stringify(res));
						console.log(res);
					});
				} else {
				}
			});
		},
		/* 调取微信扫码并返回扫码结果**/
		toScan() {
			console.log('0000000');
			jweixin.ready(function() {
				jweixin.checkJsApi({
					jsApiList: ['scanQRCode'],
					success: function(res) {
						console.warn('---------------打开扫一扫---------------', res);
						jweixin.scanQRCode({
							needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
							scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
							success: function(res) {
								var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
								uni.navigateTo({
									url: '/pages/specific/qrcodeDetail/qrcodeDetail?qrcodeInfo=' + result
								});
								console.log('扫描二维码结果====', result);
							},
							error(e) {
								console.error(e);
							}
						});
					},
					error(e) {
						console.error('checkJsApi失败', e);
					}
				});
			});
		},
		onRefresh() {
			this.pageInfo.pageNo = 1;
			// this.getListData();
			this.$nextTick(() => {
				this.$refs.pullScroll.refresh();
			});
		},
		/* 点击顶部tab标签切换**/
		tabSelect(e) {
			this.TabCur = e.currentTarget.dataset.id;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
			this.couponValidList = [];
			let serviceName = '';
			let cond = '';
			if (this.TabCur != 2 && this.TabCur != 3) {
				this.isUse = false;
				this.isLose = false;
			}
			if (this.TabCur == 0) {
				serviceName = 'srvspocp_coupon_config_receive_select';
				cond = [
					{
						colName: 'view_give_status',
						ruleType: 'eq',
						value: '已发放'
					},
					{
						colName: 'status',
						ruleType: 'eq',
						value: '有效'
					},
					{
						colName: 'user_no',
						ruleType: 'eq',
						value: uni.getStorageSync('login_user_info').user_no
					}
				];
			} else if (this.TabCur == 1) {
				serviceName = 'srvspocp_coupon_receive_record_select';
				cond = [
					{
						colName: 'user_no',
						ruleType: 'eq',
						value: uni.getStorageSync('login_user_info').user_no
					},
					{
						colName: 'view_used_status',
						ruleType: 'eq',
						value: '未使用' //已使用，未使用/已过期
					}
				];
			} else if (this.TabCur == 2) {
				serviceName = 'srvspocp_coupon_receive_record_select';
				cond = [
					{
						colName: 'user_no',
						ruleType: 'eq',
						value: uni.getStorageSync('login_user_info').user_no
					},
					{
						colName: 'view_used_status',
						ruleType: 'eq',
						value: '已使用' //已使用，未使用/已过期
					}
				];
				this.isUse = true;
				this.isLose = false;
			} else if (this.TabCur == 3) {
				serviceName = 'srvspocp_coupon_receive_record_select';
				cond = [
					{
						colName: 'user_no',
						ruleType: 'eq',
						value: uni.getStorageSync('login_user_info').user_no
					},
					{
						colName: 'view_used_status',
						ruleType: 'eq',
						value: '已过期' //已使用，未使用/已过期
					}
				];
				this.isUse = false;
				this.isLose = true;
			}
			this.req.serviceName = serviceName;
			this.req.cond = cond;
			this.onRefresh();
			// this.getDrawCoupon(serviceName,cond)
		}
	}
};
</script>
<style lang="scss">
.coupon-list-wrap {
	background-color: #f5f5f5;
	.coupon-list-main {
		// height: calc(100vh - 45px);
		display: flex;
		flex-direction: column;
		align-items: center;
		// padding: 9px 0 57px 0;
		background-color: #f5f5f5;
		margin-top: 20upx;
		.row {
			width: 95%;
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
.tab-item {
	width: 33%;
}
.add-button {
	position: fixed;
	bottom: 100upx;
	left: calc(50% - 50upx);
	width: 100upx;
	height: 100upx;
	border-radius: 50%;
	background-color: #ec625c;
	z-index: 100;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 24px;
	color: white;
	// &::before {
	// 	position: absolute;
	// 	width: 8upx;
	// 	height: 60upx;
	// 	left: calc(50% - 4upx);
	// 	top: 20upx;
	// 	content: '';
	// 	background-color: #fff;
	// }
	// &::after {
	// 	position: absolute;
	// 	width: 60upx;
	// 	height: 8upx;
	// 	content: '';
	// 	top: calc(50% - 4upx);
	// 	left: 20upx;
	// 	background-color: #fff;
	// }
	// &:active {
	// 	transform: rotate(45deg);
	// 	transition: all 0.2s;
	// }
}
</style>
