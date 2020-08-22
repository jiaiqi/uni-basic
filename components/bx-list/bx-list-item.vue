<template>
	<view class="list-item-wrap">
		<view class="list-item flex" v-if="viewType === 'normal'">
			<image
				@click="listItemImgClick"
				class="main-image"
				v-if="listData.img"
				:src="picUrl + '/file/download?bx_auth_ticket=' + bx_auth_ticket + '&fileNo=' + listData.img.value"
				:imgColName="'img'"
			></image>
			<image
				@click="listItemImgClick"
				class="main-image"
				v-if="viewTemp['img']"
				:src="picUrl + '/file/download?bx_auth_ticket=' + bx_auth_ticket + '&fileNo=' + itemData[viewTemp['img']]"
				:imgColName="'img'"
			></image>
			<view class="content-box flex-twice" :class="{ hasImg: listData.img || viewTemp['img'] }" v-if="listType === 'proc'">
				<view class="content-header">
					<view class="title" @click="listItemClick">{{ itemData[viewTemp.title] }}</view>
					<view class="status" v-if="itemData.proc_status" @click="listItemClick">
						<text class="bg-red text">{{ itemData.proc_status }}</text>
					</view>
				</view>
				<view class="title-tip" v-if="itemData['executor_user']" @click="listItemClick">
					<view class="lable">责任人：</view>
					<view class="value">{{ itemData['executor_user'] }}</view>
				</view>

				<view v-if="queryLeftWord.title" class="content proc-content" @click="listItemClick">
					<view class="content-item">
						<view class="label">{{ queryLeftWord.title }}：</view>
						<view class="value">
							{{ queryLeftWord.title === '访问地址' ? itemData._lybm_disp + '' + itemData._dybm_disp + '' + itemData._fwbm_disp : itemData[queryLeftWord.title_col] }}
						</view>
					</view>
					<view class="content-item">
						<view class="label">{{ queryLeftWord.tip }}：</view>
						<view class="value">{{ itemData[queryLeftWord.tip_col] }}</view>
					</view>
					<view class="content-item">
						<view class="label">{{ queryLeftWord.footer }}：</view>
						<view class="value">{{ itemData[queryLeftWord.footer_col] }}</view>
					</view>
				</view>
				<view v-else class="content proc-content" @click="listItemClick">
					<view class="content-item">
						<view class="label">创建时间：</view>
						<view class="value">{{ itemData.create_time.slice(0, 10) }}</view>
					</view>
					<view class="content-item">
						<view class="label">创建人：</view>
						<view class="value">{{ itemData.create_user_disp }}</view>
					</view>
					<view class="content-item">
						<view class="label">修改时间：</view>
						<view class="value">{{ itemData.modify_time.slice(0, 10) }}</view>
					</view>
				</view>
				<view class="footer">
					<view class=""></view>
					<view v-if="showButton && showButton == 'true'" class="footer-btn">
						<view v-for="(item, index) in rowButtons" :key="index">
							<button
								class="cu-btn round sm text-blue line-blue"
								:class="'cuIcon-' + item.button_type"
								v-if="deRowButDisplay(itemData, item) && !detailList && item.button_type !== 'applyProc' && item.button_type !== 'customize' && item.disp_show !== false"
								@click="footBtnClick(item)"
								:key="item.id"
							>
								{{ item.button_name }}
							</button>
							<button
								class="cu-btn round sm text-blue line-blue"
								:data-info="item"
								:data-procNo="itemData.proc_instance_no"
								open-type="share"
								v-if="item.button_type === 'applyProc'"
							>
								{{ item.button_name }}
							</button>
							<button
								:data-procNo="itemData.proc_instance_no"
								@click="footBtnClick(item)"
								class="cu-btn round sm text-blue line-blue"
								:class="'cuIcon-' + item.button_type"
								v-if="item.more_config && JSON.parse(item.more_config).type == 'qrcode' && itemData.proc_status == '完成'"
							>
								{{ item.button_name }}
							</button>
						</view>
					</view>
				</view>
			</view>
			<view class="content-box flex-twice" :class="{ hasImg: listData.img || viewTemp['img'] }" v-else>
				<view class="title content-item" v-if="listData.title" @click="listItemClick">
					<text v-if="listData.title.label">{{ listData.title.label }}:</text>
					{{ listData.title.value ? listData.title.value : '' }}
				</view>
				<view class="title-tip content-item" v-if="listData.subtitle" @click="listItemClick">
					<text v-if="listData.subtitle.label">{{ listData.subtitle.label }}:</text>
					{{ listData.subtitle.value ? listData.subtitle.value : '' }}
				</view>
				<view class="context " @click="listItemClick" v-if="listData.content">
					<view class="content content-item" v-if="listData.content">
						<text v-if="listData.content.label">{{ listData.content.label }}:</text>
						{{ listData.content.value ? listData.content.value : '' }}
					</view>
					<view class="footer content-item" v-if="listData.footer" @click="listItemClick">
						<text v-if="listData.footer.label">{{ listData.footer.label }}:</text>
						{{ listData.footer.value ? listData.footer.value : '' }}
					</view>
				</view>
				<view class="buttons" v-if="showButton && showButton == 'true' && rowButtons.length > 0">
					<view v-if="showButton && showButton == 'true'" class="foot-button">
						<button
							v-if="deRowButDisplay(itemData, item) && !detailList && item.disp_show !== false"
							class="cu-btn sm bg-blue "
							:class="'cuIcon-' + item.button_type"
							v-for="item in rowButtons"
							:key="item.id"
							@click="footBtnClick(item)"
						>
							{{ item.button_name }}
						</button>
						<text v-if="detailList" class="text-gray" :class="'cuIcon-more'"></text>
					</view>
				</view>
				<!-- <view class="title" v-if="goodsData.title" @click="listItemClick">{{ goodsData.title }}</view>
				<view class="title-tip" v-if="goodsData.tip" @click="listItemClick">
					<text class="leftWord" v-if="tempWord && tempWord.tip">{{ tempWord.tip }}:</text>
					{{ goodsData.tip }}
				</view>
				<view class="content" v-if="goodsData.price" @click="listItemClick">
					<view class="numbers">
						{{ goodsData.price }}
					</view>
				</view>
				<view class="content" v-if="goodsData.number" @click="listItemClick">
					<view class="number-item">
						<text class="leftWord" v-if="tempWord && tempWord.number">{{ tempWord.number }}:</text>
						{{ goodsData.number }}
					</view>
				</view> -->

				<!-- <view class="footer">
					<view class="foot-name" v-show="goodsData.footer" @click="listItemClick">
						<text class="leftWord" v-if="tempWord && tempWord.footer">{{ tempWord.footer }}:</text>
						{{ goodsData.footer }}
					</view>
					<view v-if="showButton && showButton == 'true'" class="foot-button">
						<text
							v-if="deRowButDisplay(itemData, item) && !detailList && item.disp_show !== false"
							class="cu-btn round sm text-blue line-blue"
							:class="'cuIcon-' + item.button_type"
							v-for="item in rowButtons"
							:key="item.id"
							@click="footBtnClick(item)"
						>
							{{ item.button_name }}
						</text>
						<button
							v-for="item in rowButtons"
							:key="item.id"
							:data-info="item"
							:data-id="itemData.id"
							@click="footBtnClick(item)"
							open-type="share"
							class="cu-btn round sm text-blue line-blue"
							:class="'cuIcon-' + item.button_type"
							v-if="item.more_config && JSON.parse(item.more_config).type == 'shareBind' && item.disp_show !== false"
						>
							{{ item.button_name }}
						</button>
						<text v-if="detailList" class="text-gray" :class="'cuIcon-more'"></text>
					</view>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
import evaluatorTo from '@/common/js/evaluator.js';
export default {
	name: 'ListItem',
	data() {
		return {
			picUrl: '',
			goodsData: {
				title: '',
				tip: '',
				img: '',
				price: '',
				footer: ''
			},
			listTemp: {
				// img: 'photo',
				// title: 'item_name',
				// subtitle: 'create_time',
				// content: 'item_no',
				// footer: 'div_type'
			},
			listData: {},
			rowButtons: [],
			bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
		};
	},
	methods: {
		listItemClick() {
			this.$emit('click-list-item', this.deepClone(this.itemData));
		},
		listItemImgClick() {
			this.$emit('click-list-item-img', this.deepClone(this.itemData));
		},
		footBtnClick(btn) {
			this.$emit('click-foot-btn', { button: this.deepClone(btn), row: this.deepClone(this.itemData) });
		},
		async getPicture(file_no) {
			const serviceName = 'srvfile_attachment_select';
			const url = this.getServiceUrl('file', serviceName, 'select');
			const req = {
				serviceName: serviceName,
				colNames: ['*'],
				condition: [{ colName: 'file_no', value: file_no, ruleType: 'eq' }]
			};
			if (file_no !== null && file_no !== '' && file_no !== undefined) {
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					const data = res.data.data[0];
					if (data) {
						const fileurl =
							this.$api.srvHost +
							'/file/download?filePath=' +
							data.fileurl +
							'&bx_auth_ticket=' +
							uni.getStorageSync('bx_auth_ticket') +
							'&thumbnailType=' +
							this.$api.imgThumbnailType;
						return fileurl;
					}
				}
			}
		},
		deRowButDisplay: function(item, button) {
			if (item && button.hasOwnProperty('isShow') && button['isShow'].length > 0) {
				let isShow = [];
				for (let key in button['isShow']) {
					switch (button['isShow'][key].ruleType) {
						case 'eq':
							if (item[button['isShow'][key].colName] === button['isShow'][key].value) {
								isShow.push(true);
							}
							break;
						case 'nq':
							if (item[button['isShow'][key].colName] !== button['isShow'][key].value) {
								isShow.push(true);
							}
							break;
						default:
							break;
					}
				}
				if (isShow.length === button['isShow'].length) {
					return true;
				} else {
					return false;
				}
			} else {
				if (button.more_config && JSON.parse(button.more_config).type == 'shareBind') {
					return false;
				}
				return true;
			}
		}
	},
	props: {
		//是否是详情列表
		detailList: {
			type: Boolean,
			default: false
		},
		viewType: {
			type: String,
			default: 'normal'
		},
		showButton: {
			type: String,
			default: 'true'
		},
		viewTemp: {
			type: Object,
			default: () => {}
		},
		tempWord: {
			type: Object,
			default: () => {}
		},
		queryLeftWord: {
			type: Object,
			default: () => {}
		},
		imageNum: {
			type: Number,
			default: 1
		},
		gridRowNum: {
			type: Number,
			default: 2
		},
		rowKey: {
			type: String,
			default: 'id'
		},
		serviceName: {
			type: String,
			default: ''
		},
		condition: {
			type: Array,
			default: () => {
				[];
			}
		},
		rownumber: {
			type: Number,
			default: 10
		},
		order: {
			type: Array,
			default: () => {
				[];
			}
		},
		showSearchBar: {
			type: Boolean,
			default: false
		},
		rowButton: {
			type: Array,
			default: () => {
				[];
			}
		},
		srv_cols: {
			type: Array,
			default: () => {
				[];
			}
		},
		itemData: {
			type: Object,
			default: () => {
				return {};
			}
		},
		listConfig: {
			type: Object,
			default: () => {}
		},
		listType: {
			type: String, //列表类型 list||proc
			default: 'list'
		}
	},
	mounted() {
		this.$nextTick(() => {
			console.log('--bxListmounted--------', this.$el);
		});
		this.picUrl = this.$api.srvHost;
	},
	watch: {
		srv_cols: {
			deep: true,
			immediate: true,
			handler(newVal) {
				let self = this;
				let arr = Object.values(this.viewTemp);
				if (arr.length === 0 && this.srv_cols && this.srv_cols.length > 0) {
					let arr2 = this.srv_cols.map(item => item.columns);
					Object.keys(this.goodsData).forEach((item, index) => {
						this.goodsData[item] = this.itemData[arr2[index]];
					});
					this.goodsData['img'] = '';
					let srvCols = this.deepClone(newVal);
					let listTemp = this.listTemp;
					if (this.listConfig && this.listConfig.more_config && this.listConfig.more_config.listTemp) {
						listTemp = this.listConfig.more_config.listTemp;
						this.listTemp = listTemp;
					}
					if (srvCols && Array.isArray(srvCols) && srvCols.length > 0) {
						srvCols.forEach(col => {
							Object.keys(listTemp).forEach(key => {
								if (col.columns === listTemp[key]) {
									let obj = {
										label: col.label,
										value: self.itemData[col.columns]
									};
									// self.listData[key] = obj;
									self.$set(self.listData, key, obj);
								}
							});
						});
					}
				} else {
					newVal.forEach(item => {
						if (item.col_type === 'Dict' && Array.isArray(item.option_list_v2)) {
							item.option_list_v2.forEach(option => {
								Object.keys(self.viewTemp).forEach(tem => {
									if (self.viewTemp[tem] === item.columns) {
										if (self.goodsData[tem] == option.value) {
											self.goodsData[tem] = option.label;
										}
									}
								});
							});
						}
					});
				}
			}
		},
		rowButton: {
			deep: true,
			immediate: true,
			handler(newValue, oldValue) {
				let item = this.itemData;
				if (!newValue) {
					return;
				}
				let rowButton = JSON.parse(JSON.stringify(newValue));
				rowButton.forEach(btn => {
					// if (btn.disp_exps) {
					let data = item;
					let more_config = {};
					try {
						more_config = JSON.parse(btn.more_config);
					} catch (e) {
						console.log(e);
						//TODO handle the exception
					}
					if (typeof more_config === 'object' && more_config && more_config.formulaShow) {
						btn['disp_show'] = evaluatorTo(data, more_config.formulaShow);
					}
					// }
				});
				this.rowButtons = rowButton;
			}
		},
		itemData: {
			deep: true,
			immediate: true,
			handler(newValue, oldValue) {
				let self = this;
				let srvCols = this.deepClone(this.srv_cols);
				let listTemp = this.listTemp;
				if (srvCols && Array.isArray(srvCols) && srvCols.length > 0) {
					srvCols.forEach(col => {
						Object.keys(listTemp).forEach(key => {
							if (col.columns === listTemp[key]) {
								let obj = {
									label: col.label,
									value: newValue[col.columns]
								};
								this.listData[key] = obj;
								this.$set(this.listData, key, obj);
							}
						});
					});
				}
				if (newValue[this.viewTemp.img]) {
					this.getPicture(newValue[this.viewTemp.img]).then(url => {
						this.goodsData.img = url;
					});
				}
				if (newValue[this.viewTemp.title]) {
					this.goodsData.title = newValue[this.viewTemp.title];
				}
				if (newValue[this.viewTemp.tip]) {
					if (this.viewTemp.tip === 'gender' && (newValue[this.viewTemp.tip] === '1' || newValue[this.viewTemp.tip] === '2')) {
						this.goodsData.tip = newValue[this.viewTemp.tip] === '1' ? '男' : newValue[this.viewTemp.tip] === '2' ? '女' : '未知';
					} else {
						this.goodsData.tip = newValue[this.viewTemp.tip];
					}
				}
				if (newValue[this.viewTemp.price]) {
					if (this.viewTemp.price === 'gender' && (newValue[this.viewTemp.price] === '1' || newValue[this.viewTemp.price] === '2')) {
						this.goodsData.price = newValue[this.viewTemp.price] === '1' ? '男' : newValue[this.viewTemp.price] === '2' ? '女' : '未知';
					} else {
						this.goodsData.price = newValue[this.viewTemp.price];
					}
				}
				if (newValue[this.viewTemp.footer]) {
					if (this.viewTemp.footer === 'gender' && (newValue[this.viewTemp.footer] === '1' || newValue[this.viewTemp.footer] === '2')) {
						this.goodsData.footer = newValue[this.viewTemp.footer] === '1' ? '男' : newValue[this.viewTemp.footer] === '2' ? '女' : '未知';
					} else {
						this.goodsData.footer = newValue[this.viewTemp.footer];
					}
				}
				if (newValue[this.viewTemp.number]) {
					this.goodsData.number = newValue[this.viewTemp.number];
				}
				this.srv_cols.forEach(item => {
					if (item.col_type === 'Dict' && Array.isArray(item.option_list_v2)) {
						item.option_list_v2.forEach(option => {
							Object.keys(self.viewTemp).forEach(tem => {
								if (self.viewTemp[tem] === item.columns) {
									if (self.goodsData[tem] == option.value) {
										self.goodsData[tem] = option.label;
									}
								}
							});
						});
					}
				});
				let rowButton = this.rowButton ? this.deepClone(this.rowButton) : [];
				rowButton.forEach(btn => {
					// if (btn.disp_exps) {
					let data = newValue;
					let more_config = {};
					try {
						more_config = JSON.parse(btn.more_config);
					} catch (e) {
						console.log(e);
						//TODO handle the exception
					}
					if (typeof more_config === 'object' && more_config && more_config.formulaShow) {
						btn['disp_show'] = evaluatorTo(data, more_config.formulaShow);
					}
					// }
				});
				this.rowButtons = rowButton;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.list-item-wrap {
	box-sizing: border-box;
	// border-bottom: dashed 1px #efefef;
	background-color: #fff;
	// margin: 10rpx auto 0;
	margin: 0 auto 10rpx;
	position: relative;
	// &::before {
	// 	position: absolute;
	// 	left: 0;
	// 	right: 0;
	// 	bottom: 0;
	// 	height: 2px;
	// 	background: repeating-linear-gradient(-45deg, #ff6c6c 0, #ff6c6c 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%);
	// 	background-size: 80px;
	// 	content: '';
	// }
	.list-item {
		// width: calc(100% - 40upx);
		display: flex;
		justify-content: space-between;
		// align-items: center;
		padding: 10upx;
		// margin: 20upx;
		box-sizing: border-box;
		.main-image {
			width: 220upx;
			height: 220upx;
			border-radius: 5upx;
			margin-right: 20upx;
			border: dashed 1px #efefef;
		}
		.content-box {
			transition: all 1s ease-out;
			box-sizing: border-box;
			max-width: 100%;
			display: flex;
			flex-wrap: wrap;
			flex-direction: column;
			color: #999;
			&.hasImg {
				max-width: calc(100% - 250rpx);
			}
			.title {
				width: 60%;
				line-height: 40upx;
				color: #333;
				font-weight: 700;
				margin-bottom: 10upx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.content-header {
				display: flex;
				justify-content: space-between;
				width: 100%;
				.title {
					width: 60%;
					line-height: 40upx;
					color: #333;
					font-weight: 700;
					margin-bottom: 10upx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.status {
					width: 35%;
					text-align: right;
					.text {
						padding: 5upx 10upx;
						border-radius: 5upx;
					}
				}
			}

			.lable {
				font-weight: normal;
				font-size: 28upx;
				color: #333;
			}
			.title-tip {
				font-size: 24upx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				display: flex;
				align-items: center;
				min-width: 50%;
				line-height: 20px;
			}

			.context {
				text-overflow: ellipsis;
				white-space: nowrap;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				padding: 10rpx 0;
				.content {
					flex: 1;
				}
				&.proc-content {
					display: flex;
					justify-content: space-between;
					flex-wrap: wrap;
					.content-item {
						max-width: 50%;
						min-width: 45%;
						display: flex;
						min-height: 50upx;
						align-items: center;
						box-sizing: border-box;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						&:last-child {
							// justify-content: flex-end;
						}
						.label {
							font-weight: normal;
							font-size: 28upx;
							color: #333;
						}
						.value {
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
					}
				}
			}
			.buttons {
				display: flex;
				justify-content: space-between;
				min-height: 80upx;
				width: 100%;
				align-items: center;
				// overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				flex-wrap: wrap;
				justify-content: flex-end;
				.foot-name {
					position: relative;
					display: inline-block;
					padding-right: 28upx;
					line-height: 44upx;
					flex: 1;
				}
				.footer-btn {
					// min-width: 60%;
					display: flex;
					justify-content: space-around;
					.cu-btn {
						margin-right: 10upx;
					}
				}
				.foot-button {
					// width: 100upx;
					// display: flex;
					// font-size: 40upx;
					// justify-content: space-around;
				}
			}
		}
	}
}
.leftWord {
	margin-right: 8upx;
}
</style>
