<template>
	<view>
		<bx-list class="bx-list" :list="listData"></bx-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				listData:[]
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
.bx-list{
	height: 500px;
	overflow: hidden;
}
</style>
