<template>
	<view class="qr-code-wrap">
		<view class="qr-code-pre">
			<!-- qrCodeData.qr_code_str -->
			<view  class="qr-code">
				<uni-qrcode v-if="qrCodeData" style="opacity: 0;" v-show="isShow"  cid="qrcode" :text="qrCodeData.qr_code_str" :size='size' :logo="logo" makeOnLoad @makeComplete='makeComplete'></uni-qrcode>
				<view v-else class="perch"></view>
				<image class="code_img" v-show="!isShow" :src="qrcodeSrc"></image>
			</view>
			
			<view class="qr-code-bot">
				<text class="left_text">更新于 {{qrCodeData.expired_date}}</text>
				<text @click="refreshCode" class="lg text-blue cuIcon-refresh right_text" :class="isRefresh?'refresh':''"></text>
			</view>
		</view>
		
		<!-- <image v-show="qrcodeSrc" :src="qrcodeSrc" ></image> -->
	</view>
</template>

<script>
	import uQRCode from '@/common/uqrcode.js'
	import uniQrcode from '@/components/uni-qrcode/uni-qrcode'
	export default {
		name:"qrCodeShow",
		components:{uniQrcode},
		data(){
			return {
				qrcodeSrc:'',				
				size:200,
				logo:'../../../static/logo.png',
				qrCodeData:'',
				isRefresh:false,
				isShow:true,
				a:'151',
				textIsShow:false,
				qrtimer:''
			}
		},
		onLoad() {
			this.getQrCodeText()
			uni.showLoading({
				title: '二维码生成中',
				mask: true
			})
		},
		beforeDestroy() {
			if(this.qrtimer){
				clearInterval(this.qrtimer)
			}
		},
		methods:{
			/* 点击刷新二维码**/
			refreshCode(){
				this.isRefresh = true
				this.textIsShow = true
				this.a = '112232343'
				this.getQrCodeText()
			},
			/* 获取生成二维码字符串**/
			async getQrCodeText(){
				this.isShow = true
				this.qrCodeData = ''
				const url = this.getServiceUrl('spocp', 'srvspocp_qr_code_create', 'operate');
				const req = [{
					serviceName: 'srvspocp_qr_code_create',
					colNames: ['*'],
					condition: [{ colName: 'qr_code_type', ruleType: 'in', value: "身份信息" }]
				}];
				let res = await this.$http.post(url,req)
				if(res.data.state === 'SUCCESS' && res.data.resultCode === 'SUCCESS'){
					this.qrCodeData = res.data.response[0].response
					this.textIsShow = true
					this.isRefresh = false					
					this.qrtimer = setInterval(()=>{
						this.automaticRefreshCode(this.qrCodeData.expired_date)
					},1000)
				}			
			},
			/* 二维码生成之后得回调**/
			makeComplete(e){
				uni.hideLoading()
				this.qrcodeSrc = e
				this.isShow = false
				console.log("e-------",e)
			},
			/* 自动刷新二维码**/
			automaticRefreshCode(qrCodeTime){
				let currDate = new Date().getTime()
				let expiredDate = new Date(qrCodeTime).getTime()
				let diffDateTime = expiredDate - currDate
				if((currDate < expiredDate) && diffDateTime <= 5000){
					this.getQrCodeText()
				}			
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qr-code-wrap{
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
	.qr-code{
		.code_img{
			width: 200px;
			height: 200px;
		}
		.perch{
			width: 200px;
			height: 200px;
		}
	}
	.qr-code-bot{
		margin-top: 20upx;
		display: flex;
		justify-content: center;
		align-items: center;
		.left_text{
			margin-right: 10upx;
		}
		.right_text{
			font-size: 16px;
		}
	}
	.refresh{
		animation: codeRefresh 2s infinite linear;
	}
	@keyframes codeRefresh {
		0%{-webkit-transform:rotate(0deg);}
		25%{-webkit-transform:rotate(90deg);}
		50%{-webkit-transform:rotate(180deg);}
		75%{-webkit-transform:rotate(270deg);}
		100%{-webkit-transform:rotate(360deg);}
	}
</style>
