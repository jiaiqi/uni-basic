<template>
	<view class="coupon_useage_wrap">
		<view class="coupon_top">
			<view class="coupon_top_title">
				{{couponData.coupon_name}}
			</view>
			<view class="coupon_main_codewrap">
				<view class="coupon_main_qrcode">
					<canvas canvas-id="qrcode" style="width: 200px;height: 200px;border: 1px solid #ccc;" />
				</view>
			</view>
			<view class="coupon_main">
				<view class="coupon_main_info">
					<view class="coupon_main_info_useTime">
						使用时间：{{couponData.used_start_time}}
					</view>
					<view class="coupon_main_info_endTime">
						过期时间：{{couponData.used_end_time}}
					</view>
					<view class="coupon_main_info_endTime">
						使用条件：景区消费满{{couponData.consume_amount}}元可用
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uQRCode from '@/common/uqrcode.js'
	export default {
		name:'getCoupon',
		data(){
			return {
				couponData:"",
				qrcodeInfo:"",
				qrtimer:''
			}
		},
		onLoad(option) {
			console.log("接收优惠券信息",option)
			let query = JSON.parse(decodeURIComponent(option.couponItem))
			this.couponData = query
			console.log("接收优惠券信息",query)
			this.getQrcodeStr()
		},
		methods:{
			make() {
				let qrcodeInfo = this.qrcodeInfo
				console.log("this.qrcodeInfo",this.qrcodeInfo)
			      uQRCode.make({
			        canvasId: 'qrcode',
			        componentInstance: this,
			        text: qrcodeInfo.qr_code_str,
			        size: 200,
			        margin: 10,
			        backgroundColor: '#ffffff',
			        foregroundColor: '#000000',
			        fileType: 'jpg',
			        correctLevel: 0,
			        success: res => {
			          console.log(res)
			        }
			      })
			},
			async getQrcodeStr(){
				let self = this
				const url = this.getServiceUrl('spocp', 'srvspocp_coupon_qr_code', 'operate');
				const req = [{
					serviceName: 'srvspocp_coupon_qr_code',
					colNames: ['*'],
					condition: [{
						colName:'id',
						ruleType:'eq',
						value:this.couponData.id
					}],
				}];
				let res = await this.$http.post(url,req)
				console.log("res===",res.data.response[0].response)
				
				if(res.data.state === 'SUCCESS'){
					this.qrcodeInfo = res.data.response[0].response
					this.make()
					this.qrtimer=setInterval(()=>{
						console.log("--------")
						let nowDate = new Date().getTime()
						let pastdueDate = new Date(this.qrcodeInfo.expired_date).getTime()
						if( pastdueDate - nowDate <= 5000){
							self.getQrcodeStr()
						}
					},1000)
					
				}
			}
		},
		beforeDestroy() {
			if(this.qrtimer){
				clearInterval(this.qrtimer)
			}
		}
		
	}
</script>

<style scoped lang="scss">
	.coupon_useage_wrap{
		width: 100%;
		height: 100vh;
		background: #6482c2;
		display: flex;
		align-items: center;
		justify-content: center;
		.coupon_top{
			display: flex;
			justify-content: center;
			align-items: center;
			padding-top: 10px;
			flex-direction: column;
			width: 95%;
			.coupon_top_title{
				display: flex;
				border-radius: 10px;
				background: white;
				width: 90%;
				padding: 20px;
				image{
					width: 45px;
					height: 45px;
					border-radius: 50%;
					margin-right: 8px;
				}
			}
			.coupon_main_codewrap{
				width: 90%;
				.coupon_main_qrcode{
					background: white;
					display: flex;
					justify-content: center;
					border-top-right-radius: 10px;
					border-top-left-radius: 10px;
					padding: 30px 0;
					border-top: 1px dashed #ccc;
				}
			}
			.coupon_main{
				width: 90%;
				background: white;
				display: flex;
				justify-content: center;
				flex-direction: column;
				border-top: 1px solid #CCCCCC;
				.coupon_main_info{
					.coupon_main_info_useTime{
						margin: 20upx;
					}
					.coupon_main_info_endTime{
						margin: 20upx;
					}
				}
			}
		}
	}
</style>
