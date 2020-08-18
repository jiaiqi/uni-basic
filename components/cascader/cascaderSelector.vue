<template>
	<view class="cascader">
		<cascader
			@tag-click="clickTag"
			:areaList="areaList"
			@line-click="clickLine"
			@show-more="showMore"
			:showSelect="showSelect"
			:column="srvInfo.column ? srvInfo.column : srvInfo.refed_col"
			:showCol="srvInfo.showCol ? srvInfo.showCol : srvInfo.key_disp_col"
			:topVal="topVal"
			:isShowMore="isShowMore"
			:lineDataDefault="lineDataDefault"
			:showtagbox="showtagbox"
		></cascader>
		<view class="button-box">
			<button class="cu-btn bg-blue" @click="emitSelectVal">{{ lineDataDefault[lineDataDefault.length - 1] ? '确 定' : '取 消' }}</button>
			<button class="cu-btn bg-blue" @click="resetData">重 置</button>
		</view>
	</view>
</template>

<script>
import cascader from '../../components/cascader/cascader.vue';
export default {
	name: 'cascaderSelector', //层叠选择器外层，处理数据
	components: { cascader },
	data() {
		return {
			areaList: [],
			total: 0,
			confirmText: '',
			parent_no: '',
			page: { total: 0, pageNo: 1, rownumber: 50 },
			showSelect: true,
			isShowMore: false, //是否显示‘更多’按钮
			outputData: {},
			lineDataDefault: [], //线数据默认值
			showtagbox: true
		};
	},
	methods: {
		resetData() {
			console.log('this.lineDataDefault', this.lineDataDefault);
			this.clickLine();
		},
		showMore() {
			// 点击了‘更多’按钮
			this.page.pageNo++;
			let condition = [];
			if (this.parent_no || this.defaultLineVal) {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: this.parent_no ? this.parent_no : this.defaultLineVal
					}
				];
			} else if (this.srvInfo.isTree === false) {
				condition = [];
			} else {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'isnull'
					}
				];
			}
			this.getAreaData(condition, true);
		},
		async getAreaData(cond, ismore, defaultVal, index, lastListIndex) {
			const srvInfo = this.srvInfo;
			const serviceName = srvInfo.serviceName;
			const appName = srvInfo.appNo ? srvInfo.appNo : srvInfo.srv_app;
			const that = this;
			uni.showLoading({
				mask: true
			});
			let url = this.getServiceUrl(appName, serviceName, 'select');
			let condition = [];
			if (cond && !ismore) {
				condition = cond;
			} else if (cond && ismore) {
				//
				condition = cond;
			} else if (srvInfo.isTree === false) {
				condition = [];
			} else {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'isnull'
					}
				];
			}
			let req = {
				serviceName: serviceName,
				colNames: ['*'],
				condition: condition,
				page: {
					pageNo: this.page.pageNo,
					rownumber: this.page.rownumber
				}
			};
			const res = await this.$http.post(url, req);
			uni.hideLoading();
			if (res && res.data && res.data.state === 'SUCCESS') {
				if (res.data.data.length === 0) {
					this.showSelect = false;
				}
				if (!defaultVal) {
					const page = res.data.page;
					that.page.pageNo = page.pageNo;
					that.page.total = page.total;
					if (ismore) {
						// 展示更多
						that.areaList = that.areaList.concat(res.data.data);
					} else {
						that.areaList = res.data.data;
					}
					if (page.total > page.pageNo * page.rownumber) {
						that.isShowMore = true;
					} else {
						that.isShowMore = false;
					}
				} else {
					const data = res.data.data;
					// this.lineDataDefault[index] = data[0]
					that.$set(this.lineDataDefault, index, data[0]);
					if (index === lastListIndex) {
						that.areaList = res.data.data;
					}
					// console.log('lineDataDefault',this.lineDataDefault)
					return data;
				}
			}
		},
		clickTag(e) {
			console.log('click-tag', e);
			if (this.srvInfo.isTree === false) {
				this.$emit('getCascaderValue', e, 'sure');
				this.areaList = [];
				this.showSelect = false;
				return;
			}
			if (e.no) {
				this.outputData = e;
				this.$emit('clickTag', e);
				if (this.srvInfo.isTree === false) {
					this.$emit('getCascaderValue', this.lineDataDefault[this.lineDataDefault.length - 1], 'sure');
					this.areaList = [];
					this.showSelect = false;
					return;
				}
				this.page.pageNo = 1;
				let condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: e.no
					}
				];
				let lineDataDefault = [...this.lineDataDefault, e];
				this.lineDataDefault = this.deepClone(lineDataDefault);
				this.parent_no = e.no;
				if (e.is_leaf === '是') {
					this.showSelect = false;
				} else {
					this.showSelect = true;
				}
				this.getAreaData(condition);
			}
		},
		clickLine(e, index) {
			console.log('click-line:', e, index);
			this.page.pageNo = 1;
			if (index < this.lineDataDefault.length - 1) {
				this.lineDataDefault = this.lineDataDefault.slice(0, index + 1);
			}
			if (e && e.no) {
				this.outputData = e;
				this.$emit('clickLine', e);
				let condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: e.no
					}
				];
				console.log('parent_no', e);
				this.parent_no = e.no;
				this.getAreaData(condition);
				if (e.is_leaf === '是') {
					this.showSelect = false;
				} else {
					this.showSelect = true;
				}
			} else if (!e) {
				this.lineDataDefault = [];
				let condition = null;
				if (this.srvInfo.parent_no) {
					condition = [
						{
							colName: 'parent_no',
							ruleType: 'eq',
							value: this.srvInfo.parent_no
						}
					];
				}
				this.getAreaData(condition);
				this.showSelect = true;
			}
		},
		emitSelectVal() {
			this.$emit('getCascaderValue', this.lineDataDefault[this.lineDataDefault.length - 1], 'sure');
		},
		async setLineData() {
			const value = this.defaultLineVal;
			if (value) {
				this.showtagbox = false;
				this.lineDataDefault = [];
				let condition = [
					{
						colName: this.srvInfo.refed_col ? this.srvInfo.refed_col : 'path_name',
						ruleType: 'eq',
						value: value
					}
				];
				//通过moreConfig中定义的refed_col查询path
				let data = await this.getAreaData(condition, false, true);
				if (data) {
					console.log('lineDataDefault', data);
					let path_no = data[0].path;
					let arr = path_no.split('/');
					// 将path分割为地区编号的数组
					arr = arr.filter(item => item && item.trim());
					for (let index = 0; index < arr.length; index++) {
						let pathNo = arr[index];
						condition = [
							{
								colName: 'no',
								ruleType: 'eq',
								value: pathNo
							}
						];
						const lastListIndex = arr.length - 1;
						let datas = await this.getAreaData(condition, false, true, index, lastListIndex);
						let parent_no = datas[datas.length - 1].parent_no;
						condition = [
							{
								colName: 'parent_no',
								ruleType: 'eq',
								value: pathNo
							}
						];
						await this.getAreaData(condition);
					}
				}
				this.showtagbox = true;
			}
		}
	},
	created() {
		if (this.srvInfo && this.srvInfo.serviceName) {
			let condition = null;
			if (this.srvInfo.parent_no) {
				condition = [
					{
						colName: 'parent_no',
						ruleType: 'eq',
						value: this.srvInfo.parent_no
					}
				];
			}
			if (this.defaultCondition.length > 0) {
				condition = this.defaultCondition;
				condition.forEach(item => {
					if (item.value[0] === "'" && item.value[item.value.length - 1] === "'") {
						item.value = item.value.replace(/\'/g, '');
						if (item.ruleType === 'like') {
							item.ruleType = 'eq';
						}
					}
				});
			}
			this.getAreaData(condition);
		}
	},
	watch: {
		defaultLineVal: {
			immediate: true,
			handler(newValue, oldValue) {
				this.setLineData();
			}
		}
	},
	props: {
		topVal: {
			type: String,
			default: '全国'
		},
		defaultLineVal: {
			type: String,
			default: ''
		},
		defaultCondition: {
			type: Array,
			default: () => []
		},
		srvInfo: {
			type: Object,
			default: () => {
				return {
					serviceName: 'srvdaq_check_area_select',
					appNo: 'daq'
				};
			}
		}
	}
};
</script>

<style lang="scss">
.cascader {
	width: 100%;
	background-color: #fff;
	min-height: 1000rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	z-index: 99999;
	overflow: scroll;
	position: relative;
	height: 100%;
	.button-box {
		width: 100%;
		padding: 20rpx;
		display: flex;
		justify-content: space-around;
		position: absolute;
		bottom: 40upx;
		button {
			flex: 1;
			&:first-child {
				margin-right: 20rpx;
			}
		}
	}
}
</style>
