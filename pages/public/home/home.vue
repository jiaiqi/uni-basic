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
			<view class="action" v-for="(item, siteIndex) in websiteList" :key="siteIndex" @click="changePage(item,siteIndex)">
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
			siteIndex:0,
			websiteList: []
		};
	},
	methods: {
		clickButton(e) {
			uni.navigateTo({
				url: e.dest_page
			});
		},
		toSomePage(){
			window.location.href  ='https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI1NjE2NzE1OA==&scene=124#wechat_redirect'
		},
		changePage(item,index) {
			let websiteList = this.websiteList;
			websiteList.forEach(wb => {
				wb.checked = false;
			});
			this.siteIndex = index
			item.checked = !item.checked;
			this.currentPage = item;
			this.getWebsiteList()
		},
		async getWebsiteList() {
			const _this = this;
			let siteIndex = this.siteIndex
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
				const res = await _this.$http.post(url, req);
				if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
					res.data.data.length > 5 ? (res.data.data.length = 5) : '';
					res.data.data.forEach((it, i) => {
						it['checked'] = false;
						if (i == 0) {
							it['checked'] = true;
						}
					});
					_this.websiteList = res.data.data;
					_this.currentPage = res.data.data[siteIndex];
					if (_this.$refs.sitePage) {
						_this.$refs.sitePage.getPageInfo(_this.currentPage.website_no, _this.currentPage.page_no);
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
