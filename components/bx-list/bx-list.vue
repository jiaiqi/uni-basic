<template>
	<view class="list-wrap">
		<s-pull-scroll ref="pullScroll" :pullDown="pullDown" :pullUp="loadData">
			<ul>
				<li v-for="(item, index) of dataList" :key="index" style="font-size:30rpx;padding:40rpx;text-align:center;border-bottom:1px solid #aaa">{{ item }}</li>
			</ul>

			<!-- 使用插槽自定义空白布局 -->
			<div slot="empty">...</div>
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
			dataList: [1, 2, 3, 4, 5, 6, 7],
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
				for (let i = this.dataList.length; i < this.dataList.length + 20; i++) {
					curList.push(i);
				}
				this.dataList = this.dataList.concat(curList);
				if (this.dataList.length > 60) {
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

<style lang="scss">
.list-wrap {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
}
</style>
