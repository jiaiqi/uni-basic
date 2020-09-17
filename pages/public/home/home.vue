<template>
	<view class="home">
		<SitePage
			:website_no="website_no"
			:page_no="currentPage.page_no"
			@clickButton="clickButton"
			ref="sitePage"
			:style="{ 'padding-bottom': websiteList.length > 1 ? '100upx' : 0 }"
		></SitePage>
		<button type="default" @click="toSomePage"></button>
		<view class="cu-bar tabbar bg-white shadow foot" v-if="websiteList.length > 1">
			<view class="action" v-for="(item, siteIndex) in websiteList" :key="siteIndex" @click="changePage(item, siteIndex)">
				<view class="cuIcon-cu-image" v-if="item.page_name == '首页' && item.page_no !== currentPage.page_no"><image src="/static/img/home.png"></image></view>
				<view class="cuIcon-cu-image" v-if="item.page_name == '首页' && item.page_no === currentPage.page_no">
					<image style="width: 25px;height: 25px;margin-bottom: 2px;" src="/static/img/home_active.png"></image>
				</view>
				<view class="cuIcon-cu-image" v-if="item.page_name == '我的' && item.page_no !== currentPage.page_no"><image src="/static/img/mine.png"></image></view>
				<view class="cuIcon-cu-image" v-if="item.page_name == '我的' && item.page_no === currentPage.page_no"><image src="/static/img/mine_active.png"></image></view>
				<view :class="{ 'text-green': item.page_no === currentPage.page_no, 'text-gray': item.page_no !== currentPage.page_no }">{{ item.page_name }}</view>
			</view>
		</view>
	</view>
</template>

<script>
import SitePage from '../homePage/homePage';
export default {
	name: 'home-page',
	components: {
		SitePage
	},
	data() {
		return {
			website_no: '',
			currentPage: {},
			siteIndex: 0,
			websiteList: []
		};
	},
	methods: {
	
		clickButton(e) {
			uni.navigateTo({
				url: e.dest_page
			});
		},
		toSomePage() {
			window.location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI1NjE2NzE1OA==&scene=124#wechat_redirect';
		},
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
		changePage(item, index) {
			if (item.page_name === '我的') {
				uni.navigateTo({
					url:"/pages/specific/couponList/couponList"
				})
				// jweixin.ready(function() {
				// 	jweixin.checkJsApi({
				// 		jsApiList: ['scanQRCode'],
				// 		success: function(res) {
				// 			console.warn('---------------打开扫一扫---------------',res);
				// 			jweixin.scanQRCode({
				// 				needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				// 				scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
				// 				success: function(res) {
				// 					var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				// 					console.log(result);
				// 				},
				// 				error(e){
				// 					console.error(e)
				// 				}
				// 			});
				// 		},
				// 		error(e){
				// 			console.error('checkJsApi失败',e)
				// 		},
				// 	});
				// });
			
			} else {
				let websiteList = this.websiteList;
				websiteList.forEach(wb => {
					wb.checked = false;
				});
				this.siteIndex = index;
				item.checked = !item.checked;
				this.currentPage = item;
				this.getWebsiteList();
			}
		},
		async getWebsiteList() {
			const self = this;
			let siteIndex = this.siteIndex;
			const url = this.getServiceUrl('daq', 'srvdaq_website_page_select', 'select');
			let website_no = this.website_no;
			if (website_no) {
				const req = {
					serviceName: 'srvdaq_website_page_select',
					colNames: ['*'],
					condition: [{ colName: 'website_no', ruleType: 'like', value: website_no }],
					page: { pageNo: 1, rownumber: 10 },
					order: [
						{
							colName: 'sorts',
							orderType: 'asc'
						}
					]
				};
				const res = await self.$http.post(url, req);
				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					res.data.data.length > 5 ? (res.data.data.length = 5) : '';
					res.data.data.forEach((it, i) => {
						it['checked'] = false;
						if (i == 0) {
							it['checked'] = true;
						}
					});
					self.websiteList = res.data.data;
					self.currentPage = res.data.data[siteIndex];
					if (self.$refs.sitePage) {
						self.$refs.sitePage.getPageInfo(self.currentPage.website_no, self.currentPage.page_no);
					}
				}
			}
		}
	},
	created() {
		// #ifdef H5
		if (this.$route.query.website_no) {
			this.website_no = this.$route.query.website_no;
		} else {
			this.website_no = 'WS2020081117350012';
		}
		// #endif
		// #ifdef MP-WEIXIN
		this.website_no = 'WS2020081117350012';
		// #endif
		this.getWebsiteList();
	},
	onShareTimeline(res) {
		console.log('onShareTimeline', res);
	},
	onLoad(option) {
		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		// #endif
		if (option.website_no) {
			this.website_no = option.website_no;
		}
		this.getSignature()
		this.selectRealNameInfo()
	},
	onShareAppMessage(res) {}
};
</script>

<style lang="scss">
.home {
	height: 100vh;
	width: 100vw;
	margin: 0;
	padding: 0;
}
.text-green {
	color: #0bc99d;
}
</style>
