<template>
	<view class="coupon-list-wrap">
		<!-- <u-navbar title="优惠券列表" :back-icon-color="backIcon" :is-back="false" :back-text-style="backText" :title-color="color" :background="background"></u-navbar> -->
		<!-- <view class="coupon-list-tab">
			<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
				<view class="flex text-center">
					<view class="cu-item flex-sub coupon-title" :class="index == TabCur ? 'cur' : ''" v-for="(item, index) in tabData" :key="index" @tap="tabSelect" :data-id="index">
						<text>{{ item.label }}</text>
					</view>
				</view>
			</scroll-view>
		</view> -->
		<view class="contentbox">
			<view v-if="tabData.length > 0" class="coupon-list-tab">
				<scroll-view scroll-x class="bg-white nav">
					<view class="flex text-center">
						<view class="cu-item flex-sub coupon-title" v-for="(item, index) in tabData" :key="index" @tap="tabSelect(item, index)">
							<text v-if="index == TabCur" class="line"></text>
							<text>{{ item.label }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="search-bar">
				<u-search placeholder="输入商户名称进行搜索" @clear="onClear" :show-action="true" :animation="true" v-model="keyword" @custom="onSearch"></u-search></view>
			<u-dropdown ref="uDropdown" :class="{'dropClose':dropClose}" @open="openDrop" @close="closeDrop">
				<u-dropdown-item  @change="changeDrop" v-model="dropValue" title="优惠券类型" :options="subsectionList"></u-dropdown-item>
			</u-dropdown>
			<!-- 	<view class="subsection" @click="clickSub">
				<u-subsection :list="subsectionList" :current="currentSub" @change="changeSub"></u-subsection>
			</view> -->
		</view>
		<sPullScroll
			ref="pullScroll"
			:heightStyle="heightStyle"
			:pullDown="pullDown"
			:pullUp="loadData"
			:enablePullDown="true"
			:enablePullUp="true"
			:top="230"
			:fixed="true"
			:bottom="0"
			finishText="我是有底线的..."
		>
			<view class="coupon-list-main">
				<view class="row">
					<view v-for="(item, index) in couponValidList" :key="index" class="receive_coupon">
						<view class="row_coupon_top" :class="TabCur == 2 ? 'efficacy-top' : ''">
							<view class="row_coupon_top_t">{{ item.coupon_name }}</view>
							<view class="row_coupon_top_b">
								<view class="row_coupon_top_b_left">
									<view class="coupon_money_w">
										<view class="coupon_money" v-if="item.coupon_type === '折扣券'">
											<text>{{ item.discount ? item.discount : 10 }}</text>
											<text>折</text>
										</view>
										<view class="coupon_money" v-if="item.coupon_type !== '折扣券'">
											<text>{{ item.used_amount }}</text>
											<text>元</text>
										</view>
										<view class="coupon_sale">
											<text v-if="item.coupon_type === '现金券'">直接抵扣现金</text>
											<text v-if="item.coupon_type === '代金券'">满{{ item.consume_amount }}元立减</text>
											<text v-if="item.coupon_type === '折扣券'">满{{ item.consume_amount ? item.consume_amount : 0 }}元可用</text>
										</view>
									</view>
									<view class="coupon_money_bod"></view>
								</view>
								<view class="row_coupon_top_b_right">
									<text>{{ item._merchant_no_disp && item._merchant_no_disp.split('/')[0] }}</text>
									<text style=" width: 400rpx; text-align: center; display: inline-block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">{{ item.coupon_remark }}</text>
								</view>
							</view>
							<view v-if="TabCur != 2" class="coupon_flag">
								<view class="coupon_flag_tri"></view>
								<text>{{ diffDay(item.used_end_time.split(' ')[0]) }}天后到期</text>
							</view>
						</view>
						<view class="row_coupon_bot" :class="TabCur == 1 ? 'sel-qrcode' : ''">
							<view class="row_coupon_bot_left">
								<view class="row_coupon_bot_l">
									<text>有效期至：</text>
									<text>{{ item.used_end_time.split(' ')[0] }}</text>
								</view>
								<view @click="drawCoupon(item)" v-if="TabCur == 0" class="row_coupon_bot_r">立即领取</view>
								<view @click="checkQrcode(item)" v-else-if="TabCur == 1" class="row_coupon_bot_r">查看二维码</view>
								<view v-else-if="TabCur == 2" class="row_coupon_bot_r efficacy">已使用</view>
							</view>

							<view v-if="TabCur == 1" class="row_coupon_bot_l_b">
								<text>使用说明：</text>
								<text class="explain_text">{{ item.coupon_explain }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<u-popup v-model="coupon_show" mode="center" border-radius="25">
				<view class="coupon_qrcod">
					<view class="qrcode_top">智慧宝塔专享红包</view>
					<view class="qrcode_cen">{{ currentCoupon && currentCoupon._merchant_no_disp && currentCoupon._merchant_no_disp.split('/')[0] }}</view>
					<view class="qrcode_img"><canvas canvas-id="qrcode" style="width: 200px;height: 200px;border: 1px solid #ccc;" /></view>
				</view>
			</u-popup>
			<!-- <view v-if="couponValidList.length > 0" class="coupon-list-main">
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
							<view v-if="item.coupon_type === '代金券'" class="criteria">满{{ item.consume_amount }}使用</view>
							<view @click="toUse(item)" v-if="TabCur == 1" class="use">去使用</view>
							<view v-if="TabCur == 2" class="use">已使用</view>
							<view @click="drawCoupon(item)" v-if="TabCur == 0" class="use">领取</view>
						</view>
					</view>
				</view>
			</view> -->
		</sPullScroll>
		<!-- <view v-if="isShopOwner" class="public-button-box"><view @click="toScan" class="lg text-gray cuIcon-scan add-button"></view></view> -->
	</view>
</template>

<script>
import sPullScroll from '@/components/s-pull-scroll';
import uQRCode from '@/common/uqrcode.js';
export default {
	name: 'couponList',
	components: { sPullScroll },
	data() {
		return {
			keyword: '', //搜索关键词
			currentSub: 3,
			subChanged: false,
			dropOption: [],
			dropValue: '',
			dropModel: '',
			dropClose:true,
			subsectionList: [
				{
					name: '现金券',
					label: '现金券',
					value: '现金券'
				},
				{
					name: '折扣券',
					label: '折扣券',
					value: '折扣券'
				},
				{
					name: '代金券',
					label: '代金券',
					value: '代金券'
				}
			],
			background: {
				backgroundColor: '#DA3D3E'

				// 导航栏背景图
				// background: 'url(https://cdn.uviewui.com/uview/swiper/1.jpg) no-repeat',
				// 还可以设置背景图size属性
				// backgroundSize: 'cover',

				// 渐变色
				// backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
			},
			coupon_show: false,
			qrtimer: null,
			pageInfo: {
				total: 0,
				rownumber: 5,
				pageNo: 1
			},
			req: {
				serviceName: '',
				cond: []
			},
			currentCoupon: '', //点击查看二维码，选中当前优惠券
			qrcodeInfo: '',
			color: '#fff',
			backIcon: '#fff',
			nowDate: this.formateDate(new Date()),
			heightStyle: 'calc(100vh-200upx)',
			backText: { color: '#fff' },
			tabData: [
				{
					label: '待领取',
					value: 0
				},
				{
					label: '待使用',
					value: 1
				},
				{
					label: '已使用',
					value: 2
				}
			],
			isLose: false,
			isUse: false,
			TabCur: 0,
			scrollLeft: 0,
			couponValidList: []
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
		this.selectRealNameInfo().then(res => {
			if (res.status === 'success') {
				// 已经注册
				// this.getSignature();
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
				this.onRefresh();
				// this.getDrawCoupon(serviceName,cond)
				// this.getCouponListNum()
			}
		});
	},
	watch: {
		coupon_show(newValue, oldValue) {
			if (!newValue && this.qrtimer) {
				clearInterval(this.qrtimer);
			}
			console.log('watch---', newValue);
		}
	},
	onShow() {
		this.getCouponListNum();
	},
	methods: {
		onClear(){
			this.onRefresh();
		},
		onSearch(e) {
			if (e) {
				console.log(this.keyword);
				this.onRefresh();
			}
		},
		openDrop(index) {
			// 展开某个下来菜单时，先关闭原来的其他菜单的高亮
			// 同时内部会自动给当前展开项进行高亮
			// console.log(index)
			this.$refs.uDropdown.highlight();
			this.dropClose = false
		},
		closeDrop(index) {
			// 关闭的时候，给当前项加上高亮
			// 当然，您也可以通过监听dropdown-item的@change事件进行处理
			this.$refs.uDropdown.highlight(index);
			console.log(index);
			this.dropClose = true
		},
		changeDrop(e) {
			console.log(e);
			// 更多的细节，如有需要请自行根据业务逻辑进行处理
			// this.$refs.uDropdown.highlight(xxx);
			if (e === this.dropModel) {
				this.dropValue = null;
			}
			this.dropModel = e;
			// if (this.dropValue) {
			// 根据dropValue筛选优惠券类型
			this.onRefresh();
			// }
		},
		changeSub(e) {
			this.subChanged = true;
		},
		clickSub() {
			if (!this.subChanged) {
				this.currentSub = 3;
			}
			this.subChanged = false;
		},
		/* 查看二维码**/
		checkQrcode(item) {
			this.coupon_show = true;
			this.currentCoupon = item;
			this.getQrcodeStr(item);
		},
		/* 生成二维码**/
		make() {
			let qrcodeInfo = this.qrcodeInfo;
			console.log('this.qrcodeInfo', this.qrcodeInfo);
			uQRCode.make({
				canvasId: 'qrcode',
				componentInstance: this,
				text: qrcodeInfo.qr_code_str,
				size: 200,
				margin: 10,
				backgroundColor: '#ffffff',
				foregroundColor: '#000000',
				fileType: 'jpg',
				correctLevel: 0,
				success: res => {
					console.log(res);
				}
			});
		},
		/* 获取当前优惠券二维码信息**/
		async getQrcodeStr(item) {
			let self = this;
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_qr_code', 'operate');
			const req = [
				{
					serviceName: 'srvspocp_coupon_qr_code',
					colNames: ['*'],
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: item.id
						}
					]
				}
			];
			let res = await this.$http.post(url, req);
			console.log('res===', res.data.response[0].response);
			if (res.data.state === 'SUCCESS') {
				this.qrcodeInfo = res.data.response[0].response;
				this.make();
				this.qrtimer = setInterval(() => {
					let nowDate = new Date().getTime();
					let pastdueDate = new Date(this.qrcodeInfo.expired_date).getTime();
					// debugger
					if (pastdueDate - nowDate <= 5000) {
						self.getQrcodeStr(item);
						console.log('000000000');
					}
				}, 1000);
			}
		},
		diffDay(date) {
			let nowDate = new Date(this.nowDate.replace(/-/g, '/')).getTime();
			let endDate = new Date(date.replace(/-/g, '/')).getTime();
			let nowDay = parseInt(endDate - nowDate) / (1000 * 60 * 60 * 24);

			return nowDay;
		},
		handleClick(item) {
			// 点击优惠券 判断是领取还是使用
			if (this.TabCur === '1') {
				// 去使用
				this.toUse(item);
			} else if (this.TabCur === 0) {
				// 领取
				this.drawCoupon(item);
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
		/* 获取优惠券列表数量**/
		async getCouponListNum() {
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_receive_record_select', 'select');
			let req = {
				serviceName: 'srvspocp_coupon_receive_record_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'user_no',
						ruleType: 'eq',
						value: uni.getStorageSync('login_user_info').user_no
					}
				],
				group: [
					{
						colName: 'id',
						type: 'count'
					},
					{
						colName: 'view_used_status',
						type: 'by'
					}
				]
			};
			let res = await this.$http.post(url, req);
			let data = res.data.data;

			let tabDatas = this.tabData;
			tabDatas.forEach(item => {
				data.forEach(tan => {
					if (item.label == tan.view_used_status) {
						this.$set(item, 'num', tan.id);
					}
				});
			});
			console.log('优惠券列表数据', res);
		},
		/* 获取可领取得优惠券**/
		async getDrawCoupon(serviceName, cond) {
			let self = this;
			const url = this.getServiceUrl('spocp', serviceName, 'select');
			// if(this.dropValue&&serviceName==='srvspocp_coupon_config_receive_select'){
			if (this.dropValue) {
				cond = cond.concat({
					colName: 'coupon_type',
					ruleType: 'eq',
					value: this.dropValue
				});
			}

			// }
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
			let currIndex = this.TabCur;
			let tabDatas = this.tabData;
			tabDatas.forEach(item => {
				if (currIndex == 0 && item.value == currIndex) {
					this.$set(item, 'num', res.data.page.total);
				}
			});
			if (this.keyword) {
				cond = cond.concat({
					colName: '_merchant_no_disp',
					ruleType: 'like',
					value: this.keyword
				});
			}
			if (this.keyword && (serviceName === 'srvspocp_coupon_config_receive_select'||serviceName==='srvspocp_coupon_receive_record_select')) {
				res.data.data = res.data.data.filter(item => {
					if (item._merchant_no_disp.indexOf(this.keyword) !== -1) {
						return item;
					}
				});
			}
			this.couponValidList = this.couponValidList.concat(res.data.data);
		},
		/* 查询商户信息**/
		async getShopUserInfo() {
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
				uni.showToast({
					title: '领取成功',
					duration: 2000
				});
				setTimeout(() => [this.onRefresh(), this.getCouponListNum()], 500);
			} else {
				uni.showToast({
					title: res.data.resultMessage,
					icon: 'none'
				});
			}

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
			this.TabCur = e.value;
			this.dropValue = null;
			this.keyword = null
			// this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
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
.dropClose{
	/deep/.u-dropdown__content{
		height: 0;
	}
}
/deep/.u-dropdown__content {
	height: auto;
	background-color: #fff;
}
.contentbox {
	background-color: #f2f5fa !important;
	position: fixed;
	width: 100%;
	top: 0;
	z-index: 100;
	.search-bar {
		padding: 10rpx 50rpx;
		background-color: #fff;
	}
}
.coupon-list-tab {
	// margin-top: 24rpx;
	.nav {
		background-color: #f5f5f5;
		.text-center {
			// margin: 0 12rpx;
			// border-radius: 16rpx;
			background-color: #c9defb;
			position: relative;
			.coupon-title {
				color: #000000;
				display: flex;
				justify-content: center;
			}
			.line {
				display: inline-block;
				width: 40upx;
				height: 3px;
				background-color: red;
				text-align: center;
				position: absolute;
				bottom: 5px;
			}
		}
	}
}
.coupon-list-wrap {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-top: 1px;
	.coupon-list-tab {
		// margin-top: 24rpx;
		.nav {
			background-color: #f5f5f5;
			.text-center {
				// margin: 0 12rpx;
				// border-radius: 16rpx;
				background-color: #c9defb;
				.coupon-title {
					color: #000000;
				}
				.cur {
					border-color: #4a8ce6;
					border-width: 3px;
				}
			}
		}
	}
	.coupon-list-main {
		// overflow: hidden;
		.row {
			width: 93%;
			margin: 0 auto;
			.receive_coupon {
				margin-top: 30rpx;
				.row_coupon_top {
					color: white;
					font-size: 28rpx;
					background: linear-gradient(180deg, #4a8ce6, #3c64d4);
					border-radius: 6px;
					padding-bottom: 20rpx;
					position: relative;
					.row_coupon_top_t {
						padding-left: 40rpx;
						padding-top: 20rpx;
						margin-bottom: 24rpx;
					}
					.row_coupon_top_b {
						display: flex;
						padding-left: 20px;
						justify-content: space-between;
						.row_coupon_top_b_left {
							display: flex;
							align-items: center;
							.coupon_money_w {
								margin-right: 44rpx;
								.coupon_money {
									margin-bottom: 20rpx;
									text {
										&:first-child {
											font-size: 30px;
											margin-right: 12px;
										}
									}
								}
							}
							.coupon_money_bod {
								width: 1px;
								background-color: white;
								height: 100rpx;
							}
						}
						.row_coupon_top_b_right {
							display: flex;
							flex-direction: column;
							margin-right: 12px;
							text {
								&:first-child {
									text-align: center;
									font-size: 16px;
									margin-bottom: 23px;
								}
							}
						}
					}
					.coupon_flag {
						position: absolute;
						top: 10px;
						right: 0;
						background-image: linear-gradient(60deg, #ffffff, transparent);
						color: #2b4ad5;
						display: flex;
						// padding: 2px 15px;
						text {
							padding: 2px 10px 2px 5px;
						}
						.coupon_flag_tri {
							width: 0;
							height: 0;
							border-top: 12px solid transparent;
							border-bottom: 12px solid transparent;
							border-left: 12px solid #4886e3;
						}
					}
				}
				.efficacy-top {
					background: #cccccc;
				}
				.row_coupon_bot {
					margin-top: 5px;
					background-color: white;
					border-radius: 7px;
					box-shadow: 1px 1px 4px rgba(26, 26, 26, 0.2);
					color: #77818c;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					padding: 30rpx 20rpx;
					position: relative;
					&::before {
						content: '';
						display: block;
						width: 94%;
						height: 100%;
						background-size: 25px 25px; /* 一个repeat的大小 */
						background-repeat: repeat-x;
						background-image: radial-gradient(#f5f5f5 8px, transparent 5px);
						position: absolute;
						top: 110rpx;
					}
					.row_coupon_bot_left {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 20rpx;
						.row_coupon_bot_r {
							border: 2px solid #204ee1;
							padding: 2px 10px;
							border-radius: 15px;
							color: #456de6;
						}
						.efficacy {
							border-color: #cccccc;
							color: #cccccc;
						}
					}
					.row_coupon_bot_l_b {
						text-overflow: -o-ellipsis-lastline;
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
					}
				}
				.sel-qrcode {
					&::before {
						top: 88%;
					}
				}
			}
		}
	}
}
// .coupon-list-main {
// 	// height: calc(100vh - 45px);
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// 	// padding: 9px 0 57px 0;
// 	background-color: #f5f5f5;
// 	margin-top: 20upx;
// 	.row {
// 		width: 95%;
// 		.carrier {
// 			display: flex;
// 			background-color: white;
// 			justify-content: space-around;
// 			margin-bottom: 15px;
// 			.left {
// 				width: 70%;
// 				display: flex;
// 				flex-direction: column;
// 				.title {
// 					padding-top: 3vw;
// 					width: 90%;
// 					margin: 0 5%;
// 					font-size: 17px;
// 				}
// 				.term {
// 					width: 90%;
// 					margin: 15px 5%;
// 					font-size: 12px;
// 					color: #999;
// 				}
// 				position: relative;
// 				.gap-top,
// 				.gap-bottom {
// 					position: absolute;
// 					width: 20upx;
// 					height: 20upx;
// 					right: -18upx;
// 					border-radius: 100%;
// 					background-color: #f5f5f5;
// 				}
// 				.gap-top {
// 					top: -10upx;
// 				}
// 				.gap-bottom {
// 					bottom: -10upx;
// 				}
// 				.shixiao {
// 					position: absolute;
// 					right: 0px;
// 					font-size: 150upx;
// 					z-index: 6;
// 					color: rgba(153, 153, 153, 0.2);
// 					width: 60px;
// 					height: 60px;
// 					image {
// 						width: 100%;
// 						height: 100%;
// 					}
// 				}
// 				.un-use {
// 					right: 3px;
// 					top: 10px;
// 					width: 60px;
// 					height: 60px;
// 					.lose {
// 						image {
// 							width: 100%;
// 							height: 100%;
// 						}
// 					}
// 				}
// 			}
// 			.right {
// 				width: 28%;
// 				display: flex;
// 				flex-direction: column;
// 				justify-content: space-around;
// 				color: white;
// 				align-items: center;
// 				background: linear-gradient(to right, #DA3D3E, #ee827f);
// 				.ticket {
// 					display: flex;
// 					align-items: center;
// 					.num {
// 						font-size: 20px;
// 						font-weight: 600;
// 					}
// 					.unit {
// 						font-size: 12px;
// 					}
// 				}
// 				.use {
// 					height: 20px;
// 					border-radius: 10px;
// 					background: white;
// 					color: #ee827f;
// 					padding: 2px 10px;
// 					font-size: 12px;
// 				}
// 			}
// 			.is-lose {
// 				background: linear-gradient(to right, #aaa, #999);
// 				.use {
// 					color: #aaa;
// 				}
// 			}
// 			.is-use {
// 				background: linear-gradient(to right, #aaa, #999);
// 				.use {
// 					color: #aaa;
// 				}
// 			}
// 		}
// 	}
// }

.coupon_qrcod {
	width: 300px;
	height: 300px;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-image: linear-gradient(180deg, #4a8ce6, #3c64d4);
	color: white;
	.qrcode_top {
		text-align: center;
		padding: 10px 0;
		font-size: 16px;
	}
	.qrcode_cen {
		text-align: center;
		font-size: 18px;
		margin-bottom: 15px;
	}
	.qrcode_img {
		width: 200px;
		height: 200px;
		image {
			width: 100%;
			height: 100%;
		}
	}
}
</style>
