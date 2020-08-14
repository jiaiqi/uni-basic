<template>
	<view class="bx-list">
		<s-pull-scroll ref="pullScroll" :pullDown="pullDown" :pullUp="loadData" :fixed="false">
			<view class="list-wrap">
				<view v-for="(item, index) of dataList" :key="index"><slot name="list-item" :data="item" :test="item"></slot></view>
			</view>
			<!-- 使用插槽自定义空白布局 -->
			<view slot="empty">...</view>
		</s-pull-scroll>
	</view>
</template>

<script>
export default {
	data() {
		return {
			pageInfo: {
				total: 100,
				rownumber: 5,
				pageNo: 1
			},
			dataList: [1, 2, 3, 4, 5, 6, 7]
		};
	},
	props: {
		list: {
			type: Array,
			default: () => []
		}
	},
	methods: {
		pullDown(pullScroll) {
			setTimeout(() => {
				this.loadData(pullScroll);
			}, 200);
		},
		loadData(pullScroll) {
			setTimeout(() => {
				if (pullScroll.page == 1) {
					this.dataList = [];
				}
				const curList = [];
				for (let i = this.dataList.length; i < this.dataList.length + 10; i++) {
					curList.push(i);
				}
				this.dataList = this.dataList.concat(curList);
				if (this.dataList.length > 30) {
					pullScroll.finish();
				} else {
					pullScroll.success();
				}
			}, 500);
		},
		// 上划加载更多
		loadMore() {
			// 请求新数据完成后调用 组件内loadOver()方法
			// 注意更新当前页码
			console.log('loadMore');
			this.dataList.concat(['a', 'b', 'c']);
			// this.$refs.loadRefresh.loadOver();
		},
		// 下拉刷新数据列表
		refresh() {
			this.$nextTick(() => {
				this.$refs.pullScroll.refresh();
			});
			console.log('refresh');
		}
	}
};
</script>

<style lang="scss" scoped>
.list-wrap {
	width: 100%;
	display: flex;
	flex-direction: column;
	padding-top: 10rpx;
	// padding: 0 20rpx;
}
</style>
