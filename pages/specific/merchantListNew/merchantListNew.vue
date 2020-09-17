<template>
	<view class="wrap">
		<view class="contentbox">
			<view class="coupon-list-tab">
			   <scroll-view scroll-x class="bg-white nav">
			    <view class="flex text-center">
			     <view class="cu-item flex-sub coupon-title"  v-for="(item, index) in tabData" :key="index" @tap="tabSelect(item,index)" >
					  <text v-if="index==TabCur" class="line"></text>
					  <text>{{ item.label }}</text>
			     </view>
			    </view>
			   </scroll-view>
			  </view>
		</view>
		  <view class="placeholder">
		  	
		  </view>
		 <view class="Qrcode" v-if="presentPage=='code'">
		 	<view class="codetext">
		 		<image src="../../../static/img/codeQr.png" mode=""></image>
				<view class="btncode">扫码核销</view>
		 	</view>
		 </view>
		<view class="list-wrap" v-if="presentPage=='merchant'">
			<view class="card_box" v-for="(item,index) in shopMsgList">
				<view class="name">
					<view class="namet">商家名称：<text class="shopName">{{item.shopname}}</text></view>
				</view>
				<view class="arer-box">
					<view class="shopmsg">
						<view class="title">所属景区：{{item.belong}}</view>
						<view class="btn" @click="detail">查看详情</view>
					</view>
					<view class="time">营业执照号码：{{item.number}}</view>
				</view>
				<view class="number">商家联系方式：{{item.phone}}</view>
			</view>
		</view>
		<staffList :staffData='staffData' v-if="presentPage=='staff'||presentPage=='record'"></staffList>
	</view>
</template>

<script>
	import staffList from '../staffList/staffList.vue'
	export default{
		components:{
			staffList
		},
		data(){
			return{
				manageListOne:{
						lableInfo:{
							labelOne:'商家名称',
							labelTwo:'所属景区',
							labelThree:'券码',
						},
						listData:[
						{
							name:'候敏华',
							phone:'黄龙山原始森林景区',
							job:'99-4514584-1424',
							btn:'已使用'
						},
						{
							name:'houminhua',
							phone:'黄龙山原始森林景区',
							job:'99-4514584-1424',
							btn:'已使用'
						},
						{
							name:'houminhua',
							phone:'黄龙山原始森林景区',
							job:'99-4514584-1424',
							btn:'已使用'
						},
						{
							name:'houminhua',
							phone:'黄龙山原始森林景区',
							job:'99-4514584-1424',
							btn:'已使用'
						}
					]
				},
				manageListTwo:{
					lableInfo:{
						labelOne:'姓名',
						labelTwo:'联系电话',
						labelThree:'岗位',
					},
					listData:[
					{
						name:'houminhua',
						phone:'187-0096-8569',
						job:'扫码核销',
						btn:'编辑信息'
					},
					{
						name:'houminhua',
						phone:'187-0096-8569',
						job:'扫码核销',
						btn:'编辑信息'
					},
					{
						name:'houminhua',
						phone:'187-0096-8569',
						job:'扫码核销',
						btn:'编辑信息'
					},
				]
				},
				staffData:{},
				tabData:[
					{
						label:'商户信息',
						pageInfo:'merchant'
					},
					{
						label:'员工管理',
						pageInfo:'staff'
					},
					{
						label:'扫码核销',
						pageInfo:'code'
					},
					{
						label:'核销记录',
						pageInfo:'record'
					},
					
				],
				TabCur:0,
				presentPage:'merchant',
				shopMsgList:[
					{
						shopname:'老村长铁锅炖羊肉',
						belong:'延安宝塔山景区',
						number:'999889665567889',
						phone:'187-0096-3680'
					},
					{
						shopname:'老村长铁锅炖羊肉',
						belong:'延安宝塔山景区',
						number:'999889665567889',
						phone:'187-0096-3680'
					},
					{
						shopname:'老村长铁锅炖羊肉',
						belong:'延安宝塔山景区',
						number:'999889665567889',
						phone:'187-0096-3680'
					},
					{
						shopname:'老村长铁锅炖羊肉',
						belong:'延安宝塔山景区',
						number:'999889665567889',
						phone:'187-0096-3680'
					},
					{
						shopname:'老村长铁锅炖羊肉',
						belong:'延安宝塔山景区',
						number:'999889665567889',
						phone:'187-0096-3680'
					},
					{
						shopname:'老村长铁锅炖羊肉',
						belong:'延安宝塔山景区',
						number:'999889665567889',
						phone:'187-0096-3680'
					},
				]
			}
		},
		methods:{
			detail(){
				uni.navigateTo({
					url:'/pages/specific/businessInfo/businessInfo'
				})
			},
			tabSelect(item,val){
				this.TabCur =val
				this.presentPage = item.pageInfo
				switch (item.pageInfo){
					case 'staff':
					this.staffData = this.manageListTwo
						break;
					case 'record':
					this.staffData = this.manageListOne
						break;
					default:
						break;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.wrap{
		background-color:#f2f5fa ;
		min-height: 100vh;
		overflow: hidden;
		.placeholder{
			height: 110upx;
		}
		.Qrcode{
			position: fixed;
			margin-top: 40%;
			margin-left:calc(50% - 225upx);
			.codetext{
				image{
					width: 450upx;
					height: 430upx; 
				}
				.btncode{
					text-align: center;
					line-height: 70upx;
					font-size: 32upx;
				}
			}
		}
		.contentbox{
			background-color:#f2f5fa !important;
			position: fixed;
			width: 100%;
			top: 0;
			z-index: 100;
		}
		.coupon-list-tab{
			// margin-top: 24rpx;
		  .nav{
		   background-color: #f5f5f5;
		   .text-center{
		    margin: 0 12rpx;
		    border-radius: 16rpx;
		    background-color: #c9defb;
			position: relative;
		    .coupon-title{
		     color:#000000;
			 display: flex;
			 justify-content: center;
		    }
		    .line{
				display:inline-block;
				width:40upx;
				height: 3px;
				background-color: red;
				text-align: center;
				position: absolute;
				bottom: 5px;
		    }
		   }
		  }
		  
		 }
	}
	.list-wrap{
		margin-top: 30upx;
		.card_box{
			padding: 0 45upx;
			background-color: #fff;
			color: #bdb7b7;
			font-size: 28upx;
			margin-bottom: 40upx;
			.name{
				border-bottom: 1upx solid #EEEEEE;
				display: flex;
				align-items: center;
				padding: 10upx 0;
				.shopName{
					color: #4e4e4e;
				}
				.namet{
					color: #77818c;
				}
				.identification{
					display: inline-block;
					width: 28upx;
					height: 28upx;
					background-color:#28d322 ;
					border-radius: 50%;
					margin-left: 55upx;
				}
			}
			.arer-box{
				padding: 10upx 0;
				border-bottom: 1upx solid #EEEEEE;
				.shopmsg{
					display: flex;
					justify-content: space-between;
					align-items: center;
					.btn{
						color: #1290f8;
						border: 1px solid #1290f8;
						font-size: 24upx;
						border-radius: 8upx;
						padding: 4upx 6upx;
					}
				}
				.title{
					font-size: 32upx;
					color: #000;
				}
				.time{
					margin-top: 20upx;
				}
			}
			.number{
				padding: 20upx 0 15upx 0;
			}
		}
	}
</style>
