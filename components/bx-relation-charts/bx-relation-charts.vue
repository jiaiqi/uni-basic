<template>
	<view class="chart-wrap">
		<!-- #ifdef APP-PLUS || MP-WEIXIN -->
		<mpvue-echarts class="ec-canvas" @onInit="onInit" canvasId="line" ref="normalChart" />
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<div :id="chartId" style="width: 100%;height:100%;"></div>
		<!-- #endif -->
	</view>
</template>

<script>
import * as echarts from '@/components/echarts/echarts.min.js';
import mpvueEcharts from '@/components/mpvue-echarts/src/echarts.vue';
export default {
	name: 'DietRecord',
	components: {
		mpvueEcharts
	},
	props: {
		chartId: {
			type: String,
			default: 're'
		},
		chartOption: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			echarts,
			onInit: this.initChart
		};
	},
	mounted() {
		// #ifdef H5
		// 若在H5环境 使用官方版本echarts
		this.initChart();
		// #endif
	},
	methods: {
		initChart(e) {
			// #ifdef APP-PLUS||MP-WEIXIN
			// 若在小程序或APP环境 使用官方版本mpvue-echarts
			let { width, height } = e;
			let canvas = this.$refs.normalChart.canvas;
			echarts.setCanvasCreator(() => canvas);
			let normalChart = echarts.init(canvas, null, {
				width: width,
				height: height
			});
			canvas.setChart(normalChart);
			normalChart.setOption(this.chartOption);
			this.$refs.normalChart.setChart(normalChart);
			// #endif
			// #ifdef H5
			// 若在H5环境 使用官方版本echarts

			let data = {
				nodes: [
					{
						name: '操作系统集团',
						category: 0
					},
					{
						name: '浏览器有限公司',
						category: 0
					},
					{
						name: 'HTML科技',
						category: 0
					},
					{
						name: 'JavaScript科技',
						category: 0
					},
					{
						name: 'CSS科技',
						category: 0
					},
					{
						name: 'Chrome',
						category: 1
					},
					{
						name: 'IE',
						category: 1
					},
					{
						name: 'Firefox',
						category: 1
					},
					{
						name: 'Safari',
						category: 1
					}
				],

				links: [
					{
						source: '浏览器有限公司',
						target: '操作系统集团',
						name: '参股'
					},
					{
						source: 'HTML科技',
						target: '浏览器有限公司',
						name: '参股'
					},
					{
						source: 'CSS科技',
						target: '浏览器有限公司',
						name: '参股'
					},
					{
						source: 'JavaScript科技',
						target: '浏览器有限公司',
						name: '参股'
					},
					{
						source: 'Chrome',
						target: '浏览器有限公司',
						name: '董事'
					},
					{
						source: 'IE',
						target: '浏览器有限公司',
						name: '董事'
					},
					{
						source: 'Firefox',
						target: '浏览器有限公司',
						name: '董事'
					},
					{
						source: 'Safari',
						target: '浏览器有限公司',
						name: '董事'
					},
					{
						source: 'Chrome',
						target: 'JavaScript科技',
						name: '法人'
					}
				]
			};

			const color1 = '#006acc';
			const color2 = '#ff7d18';
			const color3 = '#10a050';

			data.nodes.forEach(node => {
				if (node.category === 0) {
					node.symbolSize = 100;
					node.itemStyle = {
						color: color1
					};
				} else if (node.category === 1) {
					node.itemStyle = {
						color: color2
					};
				}
			});

			data.links.forEach(link => {
				link.label = {
					align: 'center',
					fontSize: 12
				};

				if (link.name === '参股') {
					link.lineStyle = {
						color: color2
					};
				} else if (link.name === '董事') {
					link.lineStyle = {
						color: color1
					};
				} else if (link.name === '法人') {
					link.lineStyle = {
						color: color3
					};
				}
			});

			let categories = [
				{
					name: '公司',
					itemStyle: {
						color: color1
					}
				},
				{
					name: '董事',
					itemStyle: {
						color: color2
					}
				}
			];

			let option = {
				title: {
					text: '知识图谱'
				},
				legend: [
					{
						// selectedMode: 'single',
						data: categories.map(x => x.name)
						// icon: 'circle'
					}
				],
				series: [
					{
						type: 'graph',
						layout: 'force',
						symbolSize: 58,
						draggable: true,
						roam: true,
						focusNodeAdjacency: true,
						categories: categories,
						edgeSymbol: ['', 'arrow'],
						// edgeSymbolSize: [80, 10],
						edgeLabel: {
							normal: {
								show: true,
								textStyle: {
									fontSize: 20
								},
								formatter(x) {
									return x.data.name;
								}
							}
						},
						label: {
							show: true
						},
						force: {
							repulsion: 2000,
							edgeLength: 120
						},
						data: data.nodes,
						links: data.links
					}
				]
			};
			const chartId = this.chartId;
			const myChart = echarts.init(document.getElementById(chartId));
			myChart.setOption(option);
			// #endif
		}
	}
};
</script>

<style>
.chart-wrap {
	height: 100%;
}
</style>
