<template>
	<view class="bg-white form-box" v-if="allField.length > 0">
		<view
			v-for="(item, index) in allField"
			:key="index"
			class="form-box-item"
			:class="{
				image: item.col_type === 'Image',
				col2: item.moreConfig && item.moreConfig.colSpan == 2,
				col3: item.moreConfig && item.moreConfig.colSpan == 3,
				row2: item.moreConfig && item.moreConfig.rowSpan == 2,
				row3: item.moreConfig && item.moreConfig.rowSpan == 3
			}"
		>
			<formItem
				:procData="procData"
				:field="item"
				:pageFormType="BxformType"
				:showTextarea="showTextarea"
				:fieldsModel="fieldModel"
				:service="service"
				:detailFiledData="detailFiledData"
				ref="fitem"
				@on-form-item="onItemButtons($event)"
				@on-value-change="onValChange($event)"
				@on-value-blur="onValBlur($event)"
				@toPage = "toPage"
				@get-cascader-val="getCascaderVal"
				@picker-change="pickerchange"
				@getRedundantData="getRedundantData"
			></formItem>
		</view>
	</view>
</template>

<script>
import formItem from '@/components/bx-form/bx-form-item.vue';
import evaluatorTo from '@/common/js/evaluator.js';
import calculateTo from '@/common/js/calculate.js';
export default {
	name: 'bx-form',
	components: { formItem },
	props: {
		fields: {
			type: Array,
			default() {
				return [];
			}
		},
		procData: {
			type: Object,
			default() {
				return {};
			}
		},
		defaultCondition: {
			type: Array,
			default() {
				return [];
			}
		},
		pageType: {
			type: String,
			default() {
				return '';
			}
		},
		BxformType: {
			type: String,
			default() {
				return 'form';
			}
		},
		service: {
			type: String,
			default() {
				return '';
			}
		},
		showTextarea: {
			type: Boolean,
			default: true
		},
		moreConfig: {
			type: Object,
			default() {
				return {};
			}
		},
		detailFiledData: {
			type: Object,
			default() {
				return {};
			}
		}
	},
	computed: {
		fieldsData: function() {
			return this.fields;
		}
	},
	data() {
		return {
			allField: [],
			fieldModel: {},
			fieldData: {},
			oldField: [],
			oldFieldModel: {},
			specialCol: [],
			more_config: {},
			calcAttr: {}
		};
	},
	created() {
		if (this.fields.length > 0) {
			this.oldField = this.deepClone(this.fields);
			this.oldField.forEach((item, index) => {
				this.oldFieldModel[item.column] = item.value;
			});
		}
		this.getAllField();
	},
	mounted() {
		if (this.fields.length > 0) {
			this.oldField = this.deepClone(this.fields);
			this.oldField.forEach((item, index) => {
				this.oldFieldModel[item.column] = item.value;
			});
		}
	},
	methods: {
		pickerchange(oriData) {
			console.log('oriData------', oriData, this.allField);
			let filed = this.allField;
			filed.forEach(item => {
				if (item.column === 'dybm') {
					// item.poupValue = oriData.lybm
					this.$set(item, 'poupValue', oriData.lybm);
				} else if (item.column === 'fwbm') {
					this.$set(item, 'louValue', oriData.lybm);
					this.$set(item, 'dyValue', oriData.dybm);
				}
			});
			console.log(this.allField);
		},
		onItemButtons(e) {
			this.$emit('on-form-item', e);
			return e;
		},
		getAllField() {
			let self = this;
			console.log('getAllField', this.fields);
			if (this.fields.length > 0) {
				let fields = this.deepClone(this.fields);
				this.oldField = this.deepClone(this.fields);
				this.oldField.forEach((item, index) => {
					this.oldFieldModel[item.column] = item.value;
				});
				this.allField = fields.map((itemData, index) => {
					this.fieldModel[itemData.column] = itemData.value;
					this.$emit('changeFieldModel', this.fieldModel);
					let item = this.fieldModel;
					if (itemData.hasOwnProperty('isShowExp') && item.hasOwnProperty(itemData.column)) {
						itemData['showExp'] = this.evalInTo(itemData, item);
						// itemData['showExp'] = this.colItemShowExps(itemData, item) ;
						itemData['display'] = itemData.isShowExp && itemData.isShowExp.length > 0 ? this.colItemShowExps(itemData, item) : itemData.display === false ? false : true;
					} else {
						itemData['showExp'] = itemData['showExp'] || true;
					}
					if (itemData.formulaShow) {
						itemData['showExp'] = evaluatorTo(item, itemData.formulaShow);
						itemData['display'] = itemData['showExp'];
					}
					itemData.valid = {
						column: itemData.column,
						valid: true,
						msg: '不能为空!'
					};
					this.specialCol.forEach(special => {
						if (special.column === itemData.column) {
							special.value ? (this.fieldModel[itemData.column] = special.value) : '';
							special.value ? (itemData['value'] = special.value) : '';
							special.disabled ? (itemData['disabled'] = special.disabled) : '';
							special.display ? (itemData['display'] = special.display) : '';
						}
					});
					return itemData;
				});
			}
		},
		onValChange(e) {
			const self = this;
			if (e.type === 'number') {
				this.fieldModel[e.column] = Number(e.value);
			} else {
				this.fieldModel[e.column] = e.value;
			}
			e.value = this.fieldModel[e.column];
			const fieldModel = JSON.parse(JSON.stringify(this.fieldModel));
			this.allField = this.allField.map((item, index) => {
				item.display = item.isShowExp && item.isShowExp.length > 0 ? this.colItemShowExps(item, this.fieldModel) : item.display === false ? false : true;
				if (item.column === e.column) {
					item.value = e.value;
				}
				return item;
			});
			this.allField.forEach(fileIf => {
				if (fileIf.formulaShow) {
					let isIfShow = evaluatorTo(fieldModel, fileIf.formulaShow);
					fileIf.display = isIfShow;
				}
				if (fileIf.calcAttr) {
					let result = calculateTo(fieldModel, fileIf.calcAttr);
					if (result || typeof result === 'number') {
						// 有返回值或者返回值为0
						fileIf.value = result;
					}
				}
				if (e._colDatas.table_name === 'bxdaq_tkry_gzjygtnl' && fileIf.column === 'assess_result') {
					if (
						fieldModel.consciousness_level === '0' &&
						(fieldModel.vision === '0' || fieldModel.vision === '1') &&
						(fieldModel.hearing === '0' || fieldModel.hearing === '1') &&
						fieldModel.communication === '0'
					) {
						fileIf.value = '能力完好';
					}
					if ((fieldModel.consciousness_level === '0' && (fieldModel.vision === '2' || fieldModel.hearing === '2')) || fieldModel.communication === '1') {
						fileIf.value = '轻度受损';
					}
					if (
						(fieldModel.consciousness_level === '0' && (fieldModel.vision === '3' || fieldModel.hearing === '3' || fieldModel.communication === '2')) ||
						(fieldModel.consciousness_level === '1' &&
							((fieldModel.vision === '3' ||
								fieldModel.vision === '2' ||
								fieldModel.vision === '1' ||
								fieldModel.vision === '0' ||
								fieldModel.hearing === '3' ||
								fieldModel.hearing === '2' ||
								fieldModel.hearing === '1' ||
								fieldModel.hearing === '0') &&
								(fieldModel.communication === '2' || fieldModel.communication === '1' || fieldModel.communication === '0')))
					) {
						fileIf.value = '中度受损';
					}
					if (
						((fieldModel.consciousness_level === '0' || fieldModel.consciousness_level === '1') &&
							(fieldModel.vision === '4' || fieldModel.hearing === '4' || fieldModel.communication === '3')) ||
						fieldModel.consciousness_level === '2'
					) {
						fileIf.value = '重度受损';
					}
				}
			});
			if (e.bx_col_type === 'fk' && e.colData && typeof e.colData === 'object' && Array.isArray(e.colData) !== true && Object.keys(e.colData).length > 0&&this.BxformType!=='add') {
				//如果当前值改变的字段是fk类型，遍历所有字段，如果有需要冗余此fk字段数据的字段，则进行冗余
				this.allField.forEach(item => {
					if (item.redundant && typeof item.redundant === 'object' && item.redundant.dependField === e.column) {
						if (item.redundant.trigger === 'always') {
							item.value = e.colData[item.redundant.refedCol];
						} else if (item.redundant.trigger === 'isnull') {
							if (!item.value) {
								item.value = e.colData[item.redundant.refedCol];
							}
						}
						this.fieldModel[item.column] = item.value;
					}
				});
			}
			this.$emit('changeFieldModel', this.fieldModel);
			console.log('valueChange', e, this.fieldModel[e.column], this.fieldModel);
		},
		onValBlur(e) {
			console.log('e', e, this.fieldModel, this.fieldModel[e.column]);
			this.fieldModel[e.column] = e.value;
			const self = this;
			this.$emit('changeFieldModel', this.fieldModel);
			this.$emit('value-blur', e);
		},
		toPage(e){
			this.$emit('toPage',e)
		},
		getDetailfieldModel() {
			return this.fieldModel;
		},
		getFieldModel() {
			console.log(this.fieldModel, 'getFieldModel');
			let valid = 0;
			let showsNum = 0;
			this.allField.map((item, index) => {
				let valids = this.$refs.fitem[index].getValid();
				console.log('字段校验', valids, item);
				if (item.display) {
					showsNum++;
					if (valids.valid) {
						valid++;
					}
				}
			});
			console.log(valid, showsNum);
			if (valid === showsNum) {
				console.log('表单校验通过', showsNum, valid, this.fieldModel);
				let model = {};
				switch (this.pageType) {
					case 'update':
						for (let key in this.fieldModel) {
							if (this.oldFieldModel[key] !== this.fieldModel[key]) {
								model[key] = this.fieldModel[key];
							}
						}
						break;
					case 'add':
						for (let key in this.fieldModel) {
							if (this.fieldModel[key] === '' && key !== 'openid') {
								delete this.fieldModel[key];
							}
						}
						model = this.fieldModel;
						break;
					default:
						model = this.fieldModel;
						break;
				}
				console.log('this.fieldModel', this.fieldModel, model);
				if (Object.keys(model).length > 0) {
					return model;
				} else {
					uni.showToast({
						title: '没有需要提交的数据',
						icon: 'none'
					});
				}
			} else {
				console.log('表单校验失败', showsNum, valid, this.fieldModel);
				uni.showToast({
					title: '请填写完信息后，再尝试提交',
					icon: 'none'
				});
				return {
					valid:false,
					fieldData:this.fieldModel
				};
			}
		},
		getCascaderVal(val) {
			if (val) {
				this.$emit('get-cascader-val', val);
			} else {
				this.$emit('get-cascader-val');
			}
		},
		getRedundantData(e) {
			if (e.bx_col_type === 'fk' && e.colData && typeof e.colData === 'object' && Array.isArray(e.colData) !== true && Object.keys(e.colData).length > 0&&this.BxformType!=='add') {
				// 拿到fk数据，遍历所有字段，如果有需要冗余此fk字段数据的字段，则进行冗余 add时不冗余
				this.allField.forEach(item => {
					if (item.redundant && typeof item.redundant === 'object' && item.redundant.dependField === e.column) {
						if (item.redundant.trigger === 'always') {
							item.value = e.colData[item.redundant.refedCol];
						} else if (item.redundant.trigger === 'isnull') {
							if (!item.value) {
								item.value = e.colData[item.redundant.refedCol];
							}
						}
						this.fieldModel[item.column] = item.value;
					}
				});
			}
		},
		onReset() {
			let allField = this.deepClone(this.oldField);
			// this.allField = allField
			this.$emit('onreset', allField);
			try {
				return true;
			} catch (e) {
				return false;
				//TODO handle the exception
			}
		}
	},
	watch: {
		fields: {
			handler: function(newval, old) {
				console.log('newval', newval, this.allField);
				this.getAllField();
			},
			deep: true
		},
		moreConfig: {
			handler: function(newval, old) {
				if (newval) {
					this.more_config = this.deepClone(newval);
				}
			},
			deep: true
		},
		fieldModel: {
			deep: true,
			handler(newVal, oldVal) {}
		}
	}
};
</script>

<style lang="scss" scoped>
.form-box {
	display: flex;
	flex-wrap: wrap;
	width: 95%;
	margin: 0 auto;
	border-radius: 10rpx;
	// display: grid;
	// grid-template-columns: repeat(auto-fill, 375rpx);
	// grid-auto-flow: row;
	.form-box-item {
		min-width: 50%;
		width: 100%;
		padding: 5rpx 0;
		display: flex;
		&.image {
			grid-row-end: span 3;
			width: 100%;
		}
		&.row2 {
			grid-row-end: span 2;
		}
		&.row3 {
			grid-row-end: span 3;
		}
		&.col3 {
			grid-column-end: span 3;
		}
		&.col2 {
			grid-column-end: span 2;
		}
	}
}
</style>
