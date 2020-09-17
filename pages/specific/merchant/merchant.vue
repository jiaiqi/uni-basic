<template>
	<view class="merch-wrap">
		<view v-if="currentIdentity" class="merchants">
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
			</view>
			<view class="placeholder"></view>
			<view v-if="presentPage === 'merchant'" class="list-wrap">
				<sPullScroll
					ref="pullScroll"
					:heightStyle="heightStyle"
					:pullDown="pullDown"
					:pullUp="loadData"
					:enablePullDown="true"
					:enablePullUp="true"
					:top="130"
					:fixed="true"
					:bottom="0"
					finishText="我是有底线的..."
				>
					<view class="card_box" v-for="(item, index) in shopMsgList" :key="index">
						<view class="name">
							<view class="namet">
								商家名称：
								<text class="shopName">{{ item.store_name }}</text>
							</view>
							<view class="namet">
								<text class="shopName">{{ item.audit_status }}</text>
							</view>
						</view>
						<view class="arer-box">
							<view class="shopmsg">
								<view class="title">所属商场：{{ item._merchant_no_disp }}</view>
								<view class="right_btn">
									<view class="btn" v-if="item.audit_status == '待审核'" @click="detail(item, 'aduit')">审核</view>
									<view class="btn" @click="detail(item, 'detail')">详情</view>
									<!-- 只有是商场管理员才有编辑和删除的按钮 -->
									<view class="btn" v-if="currentIdentity === 'merchant' && merchantUserInfo.identity === '管理员'" @click="del(item)">删除</view>
									<!-- <view class="btn" v-if="isGlys && currItem && currItem.identity === '管理员'" @click="del(item)">删除</view> -->
									<view class="btn" v-if="currentIdentity === 'merchant' && merchantUserInfo.identity === '管理员'" @click="updateInfo(item)">编辑</view>
									<!-- <view class="btn" v-if="isGlys && currItem && currItem.identity === '管理员'" @click="updateInfo(item)">编辑</view> -->
								</view>
							</view>
							<view class="time">营业执照号码：{{ item.business_no }}</view>
						</view>
						<view class="number">商家联系方式：{{ item.store_tel }}</view>
					</view>
				</sPullScroll>
			</view>
			<view class="Qrcode" v-if="presentPage == 'code'">
				<view @click="scanQrcode" class="codetext">
					<image src="../../../static/img/codeQr.png" mode=""></image>
					<view class="btncode">扫码核销</view>
				</view>
			</view>
			<business-info
				:currentUser="currentUser"
				@changeUser="changeUser"
				@test="test"
				@changeDetail="changeDetail"
				:isShow="isShow"
				v-if="tabData.length > 0 && presentPage === 'merchantInfo' && storeItem"
				:storeItem="storeItem"
			></business-info>
		</view>
		<view class="cu-modal" :class="modalName == 'Modal' ? 'show' : ''">
			<view class="cu-dialog">
				<view class="user_wrap">
					<view class="title">请选择你的身份</view>
					<u-button type="primary" v-for="(item, index) in list" :key="index" @click="radioChange(item.value)">{{ item.name }}</u-button>
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="modalName == 'SwitchIdentity' ? 'show' : ''">
			<view class="cu-dialog">
				<view class="user_wrap">
					<view class="title">请选择你的身份</view>
					<u-button type="primary" v-for="(item, index) in list" :key="index" @click="radioChange(item.value)">{{ item.name }}</u-button>
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="modalName == 'aduit' ? 'show' : ''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end"><view class="content">商户审核</view></view>
				<view class="user_audit_wrap">
					<radio-group class="block" @change="radioAuditChange">
						<view class="cu-list menu text-left">
							<view class="cu-item" v-for="(item, index) in aduitList" :key="index">
								<label class="flex ">
									<view class="flex-sub">{{ item.name }}</view>
									<radio class="round blue" :class="aduitValue == item.name ? 'checked' : ''" :checked="aduitValue == item.name ? true : false" :value="item.name"></radio>
								</label>
							</view>
						</view>
					</radio-group>

					<view v-if="aduitValue === '审核拒绝'" class="cu-form-group align-start refuse">
						<view class="title ">拒绝原因：</view>
						<textarea maxlength="-1" @input="textareaBInput" placeholder="输入拒绝原因"></textarea>
					</view>
				</view>
				<view class="cu-bar bg-white justify-around">
					<view class="action">
						<button class="cu-btn line-blue text-green" @tap="hideModal('cancel')">取消</button>
						<button class="cu-btn bg-blue margin-left" @tap="hideModal('confir')">确定</button>
					</view>
				</view>
			</view>
		</view>
		<view class="search-bar" v-if="presentPage==='record'">
			<u-search placeholder="输入使用时间进行搜索" @clear="onClear" :show-action="true" :animation="true" v-model="keyword" @custom="onSearch"></u-search>
		</view>
		<sPullScroll
			ref="pullScroll"
			:heightStyle="heightStyle"
			:pullDown="pullDown"
			:pullUp="loadData"
			:enablePullDown="true"
			:enablePullUp="true"
			:top="presentPage==='record'?200:130"
			:fixed="true"
			:bottom="0"
			finishText="我是有底线的..."
			v-if="presentPage == 'staff' || presentPage == 'storeStaff' || presentPage == 'record'"
		>
			<staffList
				:currItem="currItem"
				:currentInfo="currentIdentity === 'merchant' ? merchantUserInfo : storeUserInfo"
				:userType="currentIdentity"
				:staffData="staffData"
				@dels="dels"
				:persentPages="presentPage"
			></staffList>
		</sPullScroll>
		<view class="public-button-box" @click="goForm()">
			<view class="add-button" v-if="currentIdentity == 'merchant' && presentPage == 'staff' && is_manager"></view>
			<view class="add-button" v-if="currentIdentity === 'store' && presentPage == 'storeStaff' && storeUserInfo.audit_status == '审核通过' && isManager"></view>
			<!-- <view class="add-button" v-if="currentIdentity == 'store' && presentPage == 'storeStaff' && storeItem.audit_status == '审核通过' && is_manager"></view> -->
		</view>

		<view v-if="currentIdentity === 'store' && presentPage == 'merchantInfo' &&storeItem.audit_status == '审核拒绝'" class="button-box">
			<view class="button" @click="updateInfo(null)">修改</view>
		</view>
	</view>
</template>

<script>
import staffList from '../staffList/staffList.vue';
import businessInfo from '../businessInfo/businessInfo.vue';
import sPullScroll from '@/components/s-pull-scroll';
export default {
	name: 'merchant',
	components: { staffList, businessInfo, sPullScroll },
	data() {
		return {
			keyword:"",//搜索关键词
			
			shopMsgList: [],
			heightStyle: 'calc(100vh-200upx)',
			isRedict: false,
			textareaBValue: '',
			list: [
				{
					name: '商场负责人',
					value: 'merchant',
					disabled: false
				},
				{
					name: '商户负责人',
					value: 'store',
					disabled: false
				}
			],
			storeItem: {},
			aduitList: [
				{
					name: '审核通过',
					value: 'pass',
					disabled: false
				},
				{
					name: '审核拒绝',
					value: 'refuse',
					disabled: false
				}
			],
			value: '',
			value1: '',
			TabCur: 0,
			modalName: '',
			currentUser: '',
			isShow: '',
			staffData: {},
			manageListTwo: {
				lableInfo: {
					labelOne: '姓名',
					labelTwo: '身份证号',
					labelOneKey: 'real_name',
					labelTwoKey: 'id_card_no'
				},
				listData: []
			},
			presentPage: '',
			aduitValue: '审核通过',
			currentStore: '',
			pageInfo: {
				total: 0,
				rownumber: 5,
				pageNo: 1
			},
			tabData: [],
			shopInfos: {},
			testData: {},
			manageListOne: {
				lableInfo: {
					labelOne: '商家名称',
					labelOneKey: 'store_name',
					labelTwo: '核销时间',
					labelTwoKey: 'confirm_time'
				},
				listData: []
			},
			currItem: {},
			is_manager: uni.getStorageSync('current__info').is_manager
				? uni.getStorageSync('current__info').is_manager === '是'
				: uni.getStorageSync('current__info').identity
				? uni.getStorageSync('current__info').identity === '管理员'
				: false,
			isAdmin: false, // 是否是商场管理员
			isManager: false, // 是否是商户管理员
			merchantUserInfo: {}, //当前商场用户信息
			storeUserInfo: {}, //当前商户用户信息
			loginUserInfo: {}, // 当前登录用户信息
			merchantUserList: [], //商场用户列表
			storeUserList: [], //商户用户列表
			currentIdentity: '' // 当前身份
		};
	},
	computed: {
		isGlys() {
			try {
				if (this.currentUser === 'merchant') {
					return uni.getStorageSync('current_info').value && uni.getStorageSync('current__info').identity === '管理员' ? uni.getStorageSync('current__info').identity : false;
				} else {
					return uni.getStorageSync('current__info').is_manager === '是';
				}
			} catch (e) {}
		}
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
		changeUser(e) {
			this.currentIdentity = e.type;
			if (e.type === 'merchant') {
				// 切换商场
				this.merchantUserInfo = e.data;
				if (e.data.identity === '管理员') {
					this.isAdmin = true;
				}
			} else if (e.type === 'store') {
				// 切换商户
				this.storeUserInfo = e.data;
				if (e.data.is_manager === '是') {
					this.isManager = true;
				}
			}
		},
		test(e) {
			this.testData = e;
		},
		async del(item) {
			let self = this;
			uni.showModal({
				title: '提示',
				content: '是否确认删除?',
				success: res => {
					if (res.confirm) {
						self.delItem(item);
					}
				}
			});
		},
		async delItem(item) {
			const url = this.getServiceUrl('spocp', 'srvspocp_store_delete', 'operate');
			let req = [
				{
					serviceName: 'srvspocp_store_delete',
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
			if (res.data.resultCode === 'SUCCESS') {
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				});
				this.onRefresh();
			}
		},
		async dels(item) {
			let serviceName = null;
			if (this.currentUser === 'merchant') {
				serviceName = 'srvspocp_merchant_principal_delete';
			} else if (this.currentUser === 'store') {
				serviceName = 'srvspocp_store_users_delete';
			}
			const url = this.getServiceUrl('spocp', serviceName, 'operate');
			let req = [
				{
					serviceName: serviceName,
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
			console.log('res---', res);
			if (res.data.resultCode === 'SUCCESS') {
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				});
				this.onRefresh();
			}
		},
		changeDetail(e) {
			this.shopInfos = e;
			if (e.extra === 'merchant') {
				this.getShopDetail(e.value);
			} else if (e.extra === 'store') {
				this.getMerchantList(e.value);
			}
		},
		textareaBInput(e) {
			this.textareaBValue = e.detail.value;
		},
		updateInfo(item = null) {
			console.log(this.storeItem);
			if (!item) {
				uni.navigateTo({
					url: '/pages/specific/BusinessInfoAmend/BusinessInfoAmend?data=' + encodeURIComponent(JSON.stringify(this.storeItem))
				});
			} else {
				uni.navigateTo({
					url: '/pages/specific/BusinessInfoAmend/BusinessInfoAmend?data=' + encodeURIComponent(JSON.stringify(item)) + '&type=merchant'
				});
			}
		},
		/* **/
		scanQrcode() {
			if (this.storeItem.audit_status === '审核通过') {
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
			} else {
				this.$u.toast('请等待商户审核通过');
			}
		},
		pullDown(pullScroll) {
			console.log(pullScroll.page);
			let page = this.pageInfo;
			this.pageInfo.pageNo = 1;
			let self = this;
			setTimeout(() => {
				if (self.presentPage === 'merchant') {
					self.getMerchantList();
				} else if (self.presentPage === 'staff') {
					this.getStaffList().then(_ => {
						// this.staffData = this.manageListTwo
					});
				} else if (self.presentPage === 'storeStaff') {
					this.getStoreStaffList().then(_ => {
						// this.staffData = this.manageListTwo
					});
				} else if (self.presentPage === 'record') {
					this.getScacList();
				}
			}, 200);
		},
		onRefresh() {
			this.pageInfo.pageNo = 1;
			// this.getListData();
			this.$nextTick(() => {
				this.$refs.pullScroll.refresh();
			});
		},
		loadData(pullScroll) {
			console.log('上拉加载');
			let page = this.pageInfo;
			this.pageInfo.pageNo = pullScroll.page;
			console.log(pullScroll.page);
			if (this.currentUser === 'merchant' && this.presentPage === 'merchant') {
				this.getMerchantList(this.shopInfos.value);
			}
			if (this.currentUser === 'merchant' && this.presentPage === 'staff') {
				this.getStaffList(this.shopInfos.value);
			}
			if (this.currentUser === 'store' && this.presentPage === 'record') {
				this.getScacList();
			}
			if (this.currentUser === 'store' && this.presentPage === 'storeStaff') {
				this.getStoreStaffList();
			}
		},
		goForm() {
			// commercial//商户 merchant商家 status   mer_no 商户编号
			// let realNameInfo = uni.getStorageSync('realNameInfo');
			// let current_info = uni.getStorageSync('current__info');
			let no = '';
			if (this.currentIdentity === 'merchant') {
				no = this.merchantUserInfo.merchant_no;
			} else if (this.currentIdentity === 'store') {
				no = this.storeUserInfo.store_no;
			}
			// if (this.currentUser === 'merchant') {
			// 	if (current_info) {
			// 		no = current_info.merchant_no;
			// 	}
			// } else {
			// 	if (current_info) {
			// 		no = current_info.store_no;
			// 	}
			// }
			// let currentInfo = {
			// 	value: no
			// };
			uni.navigateTo({
				url: `/pages/specific/principalFRom/principalFRom?status=${this.currentIdentity}&no=${no}`
			});
		},
		/*注入接口权限**/
		getSignature() {
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
			console.log('进入toScan函数');
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
		hideModal(type) {
			if (type === 'confir') {
				this.auditCommercial(this.currentStore);
			} else {
				this.modalName = '';
			}
		},
		async getScacList() {
			let self = this;
			if (this.pageInfo.pageNo === 1) {
				this.manageListOne.listData = [];
				this.staffData = {};
			}
			let no = null;
			if (this.shopInfos.value) {
				no = this.shopInfos.value;
			}
			const url = this.getServiceUrl('spocp', 'srvspocp_coupon_audit_market', 'select');
			let req = {
				serviceName: 'srvspocp_coupon_audit_market',
				colNames: ['*'],
				condition: [
					{
						colName: 'store_no',
						ruleType: 'eq',
						value: no ? no : uni.getStorageSync('realNameInfo').user._store_user[0].store_no
					}
				],
				page: {
					rownumber: this.pageInfo.rownumber,
					pageNo: this.pageInfo.pageNo
				}
			};
			if(this.keyword){
				req.condition = req.condition.concat({
					colName: 'confirm_time',
					ruleType: 'like',
					value: this.keyword
				});
			}
			let res = await this.$http.post(url, req);
			// if(res.data.data.length > 0){
			self.pageInfo.total = res.data.page.total;
			self.pageInfo.pageNo = res.data.page.pageNo;
			let page = self.pageInfo;
			if (page.rownumber * page.pageNo >= page.total) {
				// finish(boolean:是否显示finishText,默认显示)
				self.$refs.pullScroll.finish();
			} else {
				self.$refs.pullScroll.success();
			}
			// }
			this.manageListOne.listData = this.manageListOne.listData.concat(res.data.data);
			this.staffData = this.manageListOne;
			console.log('res.....', res);
		},
		/* 点击Tab切换**/
		tabSelect(item, val) {
			console.log('item-', item);
			this.TabCur = val;
			this.presentPage = item.pageInfo;
			this.is_manager = uni.getStorageSync('current__info').is_manager
				? uni.getStorageSync('current__info').is_manager === '是'
				: uni.getStorageSync('current__info').identity
				? uni.getStorageSync('current__info').identity === '管理员'
				: false;
			let self = this;
			switch (item.pageInfo) {
				case 'staff':
					if (this.pageInfo.pageNo === 1) {
						this.manageListTwo.listData = [];
					}
					let user = uni.getStorageSync('current__info');
					if (user.identity === '管理员') {
						self.isRedict = true;
					} else {
						self.isRedict = false;
					}
					let users1 = uni.getStorageSync('realNameInfo').user._merchant_user;
					let currUser1 = uni.getStorageSync('current_info').value;
					let currItem1 = null;
					users1.forEach(item => {
						if (currUser1 === item.merchant_no) {
							currItem1 = item;
						}
					});
					self.currItem = currItem1;
					if (user.is_manager === '是') {
						self.isRedict = true;
					}
					this.staffData = {};
					this.onRefresh();
					break;
				case 'record':
					if (this.pageInfo.pageNo === 1) {
						this.manageListTwo.listData = [];
					}
					this.staffData = {};
					this.onRefresh();
					break;
				case 'merchant':
					let user3 = uni.getStorageSync('current__info');
					if (user3.identity === '管理员') {
						self.isRedict = true;
					} else {
						self.isRedict = false;
					}
					let users = uni.getStorageSync('realNameInfo').user._merchant_user;
					let currUser = uni.getStorageSync('current_info').value;
					let currItem = null;
					users.forEach(item => {
						if (currUser === item.merchant_no) {
							currItem = item;
						}
					});
					self.currItem = currItem;
					if (user3.is_manager === '是') {
						self.isRedict = true;
					}
					this.onRefresh();
					break;
				case 'storeStaff':
					if (this.pageInfo.pageNo === 1) {
						this.manageListTwo.listData = [];
					}
					this.staffData = {};
					this.onRefresh();
					let user2 = uni.getStorageSync('current__info');
					if (user2.identity === '管理员') {
						self.isRedict = true;
					} else {
						self.isRedict = false;
					}
					if (user2.is_manager === '是') {
						self.isRedict = true;
					} else {
						self.isRedict = false;
					}
					break;
				case 'merchantInfo':
					let user1 = uni.getStorageSync('current__info');
					if (user1.identity === '管理员') {
						self.isRedict = true;
					} else {
						self.isRedict = false;
					}
					if (user1.is_manager === '是') {
						self.isRedict = true;
					}
					if (this.currentUser === 'merchant') {
						this.getShopDetail(this.shopInfos.value);
					} else if (this.currentUser === 'store') {
						this.getMerchantList(this.shopInfos.value);
					}
					break;
				default:
					break;
			}
		},
		/* 审核商户**/
		async auditCommercial(item) {
			const url = this.getServiceUrl('spocp', 'srvspocp_store_audit', 'operate');
			let req = [
				{
					serviceName: 'srvspocp_store_audit',
					colNames: ['*'],
					condition: [
						{
							colName: 'id',
							ruleType: 'eq',
							value: item.id
						}
					],
					data: [
						{
							audit_status: this.aduitValue,
							audit_remark: this.textareaBValue
						}
					]
				}
			];
			if (this.aduitValue !== '审核通过' && !this.textareaBValue) {
				uni.showToast({
					title: '请输入拒绝原因',
					icon: 'none'
				});
				return;
			}
			let res = await this.$http.post(url, req);
			if (res.data.resultCode === 'SUCCESS') {
				uni.showToast({
					title: '审核成功',
					icon: 'none'
				});
				this.getMerchantList();
				this.modalName = '';
			} else {
				uni.showToast({
					title: res.data.resultMessage,
					icon: 'none'
				});
			}
		},
		/* 查询员工列表**/
		async getStoreStaffList() {
			let self = this;
			let no = null;
			if (this.shopInfos.value) {
				no = this.shopInfos.value;
			}
			if (self.pageInfo.pageNo === 1) {
				this.manageListTwo.listData = [];
			}
			const url = this.getServiceUrl('spocp', 'srvspocp_store_users_select', 'select');
			let store_no = uni.getStorageSync('realNameInfo').user._store_user[0].store_no;
			let req = {
				serviceName: 'srvspocp_store_users_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'store_no',
						ruleType: 'eq',
						value: no ? no : store_no
					}
				],
				page: {
					rownumber: this.pageInfo.rownumber,
					pageNo: this.pageInfo.pageNo
				}
			};
			let res = await this.$http.post(url, req);
			self.pageInfo.total = res.data.page.total;
			self.pageInfo.pageNo = res.data.page.pageNo;
			let page = self.pageInfo;
			if (page.rownumber * page.pageNo >= page.total) {
				// finish(boolean:是否显示finishText,默认显示)
				self.$refs.pullScroll.finish();
			} else {
				self.$refs.pullScroll.success();
			}
			this.manageListTwo.listData = this.manageListTwo.listData.concat(res.data.data);
			this.staffData = this.manageListTwo;
		},
		/* 查询负责人列表**/
		async getStaffList(no = null) {
			let self = this;
			if (this.shopInfos.value) {
				no = this.shopInfos.value;
			}
			if (self.pageInfo.pageNo === 1) {
				this.manageListTwo.listData = [];
			}
			const url = this.getServiceUrl('spocp', 'srvspocp_merchant_principal_select', 'select');
			let req = {
				serviceName: 'srvspocp_merchant_principal_select',
				colNames: ['*'],
				condition: [],
				page: {
					rownumber: this.pageInfo.rownumber,
					pageNo: this.pageInfo.pageNo
				}
			};
			let merchant_no = uni.getStorageSync('realNameInfo').user._merchant_user[0].merchant_no;
			req.condition = [
				{
					colName: 'merchant_no',
					ruleType: 'eq',
					value: no ? no : merchant_no
				}
			];
			let res = await this.$http.post(url, req);
			self.pageInfo.total = res.data.page.total;
			self.pageInfo.pageNo = res.data.page.pageNo;
			let page = self.pageInfo;
			if (page.rownumber * page.pageNo >= page.total) {
				// finish(boolean:是否显示finishText,默认显示)
				self.$refs.pullScroll.finish();
			} else {
				self.$refs.pullScroll.success();
			}
			this.manageListTwo.listData = this.manageListTwo.listData.concat(res.data.data);
			this.staffData = this.manageListTwo;
		},
		/* 查看详情**/
		detail(item, type) {
			if (type == 'detail') {
				uni.navigateTo({
					url: '/pages/specific/businessInfo/businessInfo?storeDetail=' + encodeURIComponent(JSON.stringify(item))
				});
			} else if (type === 'aduit') {
				this.modalName = 'aduit';
				this.currentStore = item;
				this.value1 = '审核通过';
			}
		},
		radioAuditChange(e) {
			this.aduitValue = e.detail.value;
		},
		/* 查询商场详情**/
		async getShopDetail(no = null) {
			const url = this.getServiceUrl('spocp', 'srvspocp_merchant_manage_select', 'select');
			let user_info = uni.getStorageSync('login_user_info');
			let req = {
				serviceName: 'srvspocp_merchant_manage_select',
				colNames: ['*'],
				condition: [
					{
						colName: 'merchant_no',
						ruleType: 'eq',
						value: no ? no : uni.getStorageSync('realNameInfo').user._merchant_user[0].merchant_no
					}
				]
			};
			debugger;
			let res = await this.$http.post(url, req);
			this.storeItem = res.data.data[0];
		},
		radioChange(e) {
			// 选择身份 商场管理员(审批者)||商户管理员
			let tabData = [];
			this.presentPage = 'merchantInfo';
			this.modalName = '';
			this.currentUser = e;
			this.currentIdentity = e; // 当前身份
			if (e === 'merchant') {
				//商场管理员(审批者)
				tabData = [
					{
						label: '商场详情',
						pageInfo: 'merchantInfo'
					},
					{
						label: '商户管理',
						pageInfo: 'merchant'
					},
					{
						label: '负责人',
						pageInfo: 'staff'
					}
				];
				this.getShopDetail(this.merchantUserInfo.merchant_no);
			} else if (e === 'store') {
				// 商户管理员
				tabData = [
					{
						label: '商户信息',
						pageInfo: 'merchantInfo'
					},
					{
						label: '员工管理',
						pageInfo: 'storeStaff'
					},
					{
						label: '扫码核销',
						pageInfo: 'code'
					},
					{
						label: '核销记录',
						pageInfo: 'record'
					}
				];
				this.getMerchantList(this.storeUserInfo.store_no); // 根据商户编号查询商户信息
			}
			this.isShow = true;
			this.tabData = this.tabData.concat(tabData);
			return;
			let user = uni.getStorageSync('realNameInfo').user;
			this.modalName = '';
			this.currentUser = e;
			// let tabData = [];
			if (e === 'merchant') {
				//商场负责人
				let currentInfo = { value: user._merchant_user[0].merchant_no };
				uni.setStorageSync('current_info', currentInfo);
				uni.setStorageSync('current__info', user._merchant_user[0]);
				this.presentPage = 'merchantInfo';
				tabData = [
					{
						label: '商场详情',
						pageInfo: 'merchantInfo'
					},
					{
						label: '商户管理',
						pageInfo: 'merchant'
					},
					{
						label: '负责人',
						pageInfo: 'staff'
					}
				];
				this.isShow = false;
				this.getShopDetail();
			} else if (e === 'store') {
				//商户负责人
				let currentInfo = { value: user._store_user[0].store_no };
				uni.setStorageSync('current_info', currentInfo);
				uni.setStorageSync('current__info', user._store_user[0]);
				this.presentPage = 'merchantInfo';
				tabData = [
					{
						label: '商户信息',
						pageInfo: 'merchantInfo'
					},
					{
						label: '员工管理',
						pageInfo: 'storeStaff'
					},
					{
						label: '扫码核销',
						pageInfo: 'code'
					},
					{
						label: '核销记录',
						pageInfo: 'record'
					}
				];
			}
			this.tabData = tabData;
			this.isShow = true;
			this.getMerchantList();
			// })
		},
		/* 查询商户列表**/
		async getMerchantList(no = null) {
			let self = this;
			if (self.shopInfos.value) {
				no = this.shopInfos.value;
			}
			const url = self.getServiceUrl('spocp', 'srvspocp_store_select', 'select');
			let user_info = uni.getStorageSync('login_user_info');
			let req = {
				serviceName: 'srvspocp_store_select',
				colNames: ['*'],
				condition: [],
				page: {
					rownumber: self.pageInfo.rownumber,
					pageNo: self.pageInfo.pageNo
				}
			};
			if (self.currentIdentity === 'merchant') {
				let merchant_no = uni.getStorageSync('realNameInfo').user._merchant_user[0].merchant_no;
				req.condition = [
					{
						colName: 'merchant_no',
						ruleType: 'eq',
						value: no ? no : merchant_no
					}
				];
			} else if (self.currentIdentity === 'store') {
				let store_no = uni.getStorageSync('realNameInfo').user._store_user[0].store_no;
				req.condition = [
					{
						colName: 'store_no',
						ruleType: 'eq',
						value: no ? no : store_no
					}
				];
			}
			let res = await self.$http.post(url, req);
			console.log('res---***', res);
			if (self.pageInfo.pageNo === 1) {
				self.shopMsgList = [];
			}
			if (self.currentIdentity === 'merchant') {
				self.shopMsgList = self.shopMsgList.concat(res.data.data);
				self.pageInfo.total = res.data.page.total;
				self.pageInfo.pageNo = res.data.page.pageNo;
				let page = self.pageInfo;
				if (page.rownumber * page.pageNo >= page.total) {
					// finish(boolean:是否显示finishText,默认显示)
					self.$refs.pullScroll.finish();
				} else {
					self.$refs.pullScroll.success();
				}
			} else {
				self.storeItem = res.data.data[0];
			}
		}
	},
	async onLoad() {
		/**
		 * 默认数据处理
		 */
		let res = await this.selectRealNameInfo();
		if (res && res.status === 'success') {
			let self = this;
			// 已经实名认证 有实名认证信息
			self.getSignature();
			self.loginUserInfo = self.deepClone(res.user);
			delete self.loginUserInfo._merchant_user;
			delete self.loginUserInfo._store_user;
			self.merchantUserList = self.deepClone(res.user._merchant_user);
			self.storeUserList = self.deepClone(res.user._store_user);
			let _store_user = res.user._store_user;
			let _merchant_user = res.user._merchant_user;
			if (self.merchantUserList.length > 0) {
				self.merchantUserInfo = self.deepClone(self.merchantUserList[0]);
				if (self.merchantUserInfo.identity === '管理员') {
					// 默认商场用户是商场管理员
					self.isAdmin = true;
				}
			}
			if (self.storeUserList.length > 0) {
				self.storeUserInfo = self.deepClone(self.storeUserList[0]);
				if (self.storeUserInfo.is_manager === '是') {
					// 默认商户用户是商户管理员
					self.isManager = true;
				}
			}
			if (_store_user.length > 0 && _merchant_user.length > 0) {
				// 有商场管理员(审批者)和商户管理员两个身份
				// 弹出身份选择弹框
				self.modalName = 'SwitchIdentity';
			} else if (_store_user.length > 0) {
				// 是商户管理员
				let tabData = [
					{
						label: '商户信息',
						pageInfo: 'merchantInfo'
					},
					{
						label: '员工管理',
						pageInfo: 'storeStaff'
					},
					{
						label: '扫码核销',
						pageInfo: 'code'
					},
					{
						label: '核销记录',
						pageInfo: 'record'
					}
				];
				self.currentIdentity = 'store'; // 当前身份为商户管理员
				self.presentPage = 'merchantInfo'; // 当前展示页面为商户信息页
				self.getMerchantList(self.storeUserInfo.store_no); // 根据商户编号查询商户信息
				self.tabData = tabData;
				self.isShow = true;
				self.currItem = self.storeUserInfo;
			} else if (_merchant_user.length > 0) {
				// 是商场管理员
				self.currentIdentity = 'merchant';
				self.presentPage = 'merchantInfo';
				self.getShopDetail(self.merchantUserInfo.merchant_no); // 根据商场编号查询商场详情
				let tabData = [
					{
						label: '商场详情',
						pageInfo: 'merchantInfo'
					},
					{
						label: '商户管理',
						pageInfo: 'merchant'
					},
					{
						label: '负责人',
						pageInfo: 'staff'
					}
				];
				self.tabData = tabData;
				self.isShow = true;
				self.currItem = self.merchantUserInfo;
			} else if (_store_user.length <= 0 && _merchant_user.length <= 0) {
				// 当前登录用户既不是商场管理员或审批者，也不是商户管理员
				uni.showModal({
					title: '提示',
					content: '您未注册商户,是否前往商户注册?',
					success(res) {
						if (res.confirm) {
							// 跳转到商家登记页面
							uni.navigateTo({
								url: '/pages/specific/merchantReg/merchantReg'
							});
						} else {
							// 跳转到首页
							uni.reLaunch({
								url: self.$api.homePath,
								fail(res) {
									if (res.errMsg) {
										if (res.errMsg.indexOf('is not fond') !== -1 || self.$api.homePath.indexOf('http') !== -1) {
											window.location.href = self.$api.homePath;
										}
									}
								}
							});
						}
					}
				});
			}
			return;
			let user = res.user;
			// let user = uni.getStorageSync('realNameInfo').user;
			let user2 = uni.getStorageSync('current__info');
			if (user2.identity === '管理员') {
				self.isRedict = true;
			} else {
				self.isRedict = false;
			}
			if (user2.is_manager === '是') {
				self.isRedict = true;
			} else {
				self.isRedict = false;
			}
			if (user._store_user.length > 0 && user._merchant_user.length > 0) {
				self.modalName = 'Modal';
			} else if (user._store_user.length > 0) {
				uni.setStorageSync('current__info', user._store_user[0]);
				uni.setStorageSync('current_info', { value: user._store_user[0].store_no });
				self.currentUser = 'store';
				self.presentPage = 'merchantInfo';
				self.getMerchantList();
				let tabData = [
					{
						label: '商户信息',
						pageInfo: 'merchantInfo'
					},
					{
						label: '员工管理',
						pageInfo: 'storeStaff'
					},
					{
						label: '扫码核销',
						pageInfo: 'code'
					},
					{
						label: '核销记录',
						pageInfo: 'record'
					}
				];
				self.tabData = tabData;
				self.isShow = true;
			} else if (user._merchant_user.length > 0) {
				uni.setStorageSync('current__info', user._merchant_user[0]);
				uni.setStorageSync('current_info', { value: user._merchant_user[0].merchant_no });
				self.currentUser = 'merchant';
				self.presentPage = 'merchantInfo';
				// self.getMerchantList()
				self.getShopDetail();
				let tabData = [
					{
						label: '商场详情',
						pageInfo: 'merchantInfo'
					},
					{
						label: '商户管理',
						pageInfo: 'merchant'
					},
					{
						label: '负责人',
						pageInfo: 'staff'
					}
				];
				self.tabData = tabData;
				self.isShow = true;
			} else if (user._store_user.length <= 0 && user._merchant_user.length <= 0) {
				uni.showModal({
					title: '提示',
					content: '您未注册商户,是否前往商户注册?',
					success(res) {
						if (res.confirm) {
							// 跳转到商家登记页面
							uni.navigateTo({
								url: '/pages/specific/merchantReg/merchantReg'
							});
						} else {
							// 跳转到首页
							uni.reLaunch({
								url: self.$api.homePath,
								fail(res) {
									if (res.errMsg) {
										if (res.errMsg.indexOf('is not fond') !== -1 || self.$api.homePath.indexOf('http') !== -1) {
											window.location.href = self.$api.homePath;
										}
									}
								}
							});
						}
					}
				});
			}
			user = uni.getStorageSync('current__info');
			if (user.identity === '管理员') {
				self.isRedict = true;
			}
			if (user.is_manager === '是') {
				self.isRedict = true;
			}
			console.log('---------', self.isRedict);
			// }
		}
	},
	onShow() {
		if (this.presentPage && this.presentPage === 'staff') {
			this.getStaffList();
		} else if (this.presentPage && this.presentPage === 'storeStaff') {
			this.getStoreStaffList();
		} else if (this.currentUser && this.currentUser === 'merchant' && this.presentPage && this.presentPage === 'merchant') {
			this.getMerchantList();
		} else if (this.currentUser && this.currentUser === 'store' && this.presentPage && this.presentPage === 'merchantInfo') {
			this.getMerchantList();
		}
	}
};
</script>

<style lang="scss" scoped>
	.search-bar{
		background-color: #fff;
		padding:  10px;
	}
.merch-wrap {
	background-color: #f2f5fa;
	min-height: 100vh;
	.merchants {
		.placeholder {
			height: 90upx;
		}
	}
}
.refuse {
	border-top: 1px solid rgb(248, 248, 248);
	.title {
		text-align: right;
		width: 6rem;
		font-size: 17px;
		margin-left: 0.6rem;
		color: #606266;
	}
	textarea {
		text-align: left;
	}
}
.contentbox {
	background-color: #f2f5fa !important;
	position: fixed;
	width: 100%;
	top: 0;
	z-index: 100;
}
.coupon-list-tab {
	.nav {
		background-color: #f5f5f5;
		.text-center {
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
.list-wrap {
	margin-top: 30upx;
	/deep/ .card_box {
		padding: 0 45upx;
		background-color: #fff;
		color: #bdb7b7;
		font-size: 28upx;
		margin-bottom: 40upx;
		.name {
			border-bottom: 1upx solid #eeeeee;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10upx 0;
			.shopName {
				color: #4e4e4e;
			}
			.namet {
				color: #77818c;
			}
			.identification {
				display: inline-block;
				width: 28upx;
				height: 28upx;
				background-color: #28d322;
				border-radius: 50%;
				margin-left: 55upx;
			}
		}
		.arer-box {
			padding: 10upx 0;
			border-bottom: 1upx solid #eeeeee;
			.shopmsg {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				.title {
					flex: 1;
					flex-wrap: wrap;
				}
				.right_btn {
					display: flex;
					.btn {
						color: #1290f8;
						border: 1px solid #1290f8;
						font-size: 24upx;
						border-radius: 8upx;
						padding: 4upx 6upx;
						margin-left: 10rpx;
					}
				}
			}
			.title {
				font-size: 32upx;
				color: #000;
			}
			.time {
				margin-top: 20upx;
			}
		}
		.number {
			padding: 20upx 0 15upx 0;
		}
	}
}
.user_wrap {
	padding: 60rpx;
	.u-btn {
		margin-top: 20rpx;
		background: linear-gradient(to right, rgb(54, 119, 238) 0%, rgba(54, 119, 238, 0.9) 70%, rgba(54, 119, 238, 0.7) 100%);
	}
}
.user_wrap /deep/ .u-radio {
	padding: 20rpx;
}
.user_audit_wrap {
	background-color: white;
}
.user_audit_wrap /deep/ .u-radio {
	&:nth-child(1) {
		margin-right: 90upx;
	}
	// padding: 20rpx;
}
.user_audit_wrap /deep/ .cu-list {
	display: flex;
	font-size: 16px;
	margin-left: 44rpx;
}
.user_audit_wrap /deep/ .round {
	margin-left: 10rpx;
	&::before {
		right: 2px;
	}
}
.user_audit_wrap /deep/ .uni-radio-input {
	width: 40rpx;
	height: 40rpx;
}

.u-radio-group {
	width: 100%;
	padding-left: 2rem;
	padding-top: 13px;
	display: flex;
}
.Qrcode {
	position: fixed;
	margin-top: 40%;
	margin-left: calc(50% - 225upx);
	.codetext {
		image {
			width: 450upx;
			height: 430upx;
		}
		.btncode {
			text-align: center;
			line-height: 70upx;
			font-size: 32upx;
		}
	}
}
.add-button {
	position: fixed;
	bottom: 100upx;
	left: calc(50% - 50upx);
	width: 100upx;
	height: 100upx;
	border-radius: 50%;
	background: linear-gradient(to right, rgb(54, 119, 238) 0%, rgba(54, 119, 238, 0.9) 70%, rgba(54, 119, 238, 0.7) 100%);
	z-index: 100;
	&::before {
		position: absolute;
		width: 8upx;
		height: 60upx;
		left: calc(50% - 4upx);
		top: 20upx;
		content: '';
		background-color: #fff;
	}
	&::after {
		position: absolute;
		width: 60upx;
		height: 8upx;
		content: '';
		top: calc(50% - 4upx);
		left: 20upx;
		background-color: #fff;
	}
	&:active {
		transform: rotate(45deg);
		transition: all 0.2s;
	}
}
.button-box {
	display: flex;
	padding: 80rpx 0;
	width: 50%;
	margin: 0 auto;
	justify-content: space-around;
	.button {
		padding: 10rpx 50rpx;
		border-radius: 50rpx;
		flex: 1;
		max-width: 70%;
		text-align: center;
		background: linear-gradient(to right, rgb(54, 119, 238) 0%, rgba(54, 119, 238, 0.9) 70%, rgba(54, 119, 238, 0.7) 100%);
		color: #fff;
		&:active {
			transform: translateY(2px) translateX(1px);
		}
	}
}
</style>
