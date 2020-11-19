// 获取图片信息
function getImageInfo(src) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src,
			success: info => {
				resolve(info);
			},
			fail: () => {
				reject(null);
			}
		});
	});
}
/**
 * 图片压缩方法-canvas压缩
 * @param {File}  File对象
 * @param {Number}  maxPx - 宽和高的最大值
 * @param {Number} quality - 压缩质量,可选值0-1
 */
function compressUpload(file, quality = 0.5, maxPx) {
	return new Promise((resolve, reject) => {
		let image = new Image();
		image.src = URL.createObjectURL(file);
		getImageInfo(file.path).then(imgInfo => {
			image.width = imgInfo.width;
			image.height = imgInfo.height;
			let canvas = document.createElement('canvas');
			let ctx = canvas.getContext('2d');
			let initSize = image.src.length;
			let {
				width,
				height
			} = image;
			if (maxPx) {
				// 限制最大宽度/高度
				if (image.width > image.height) {
					height = Math.floor(image.height / (image.width / maxPx));
					width = maxPx;
				} else {
					width = Math.floor(image.width / (image.height / maxPx));
					height = maxPx;
				}
			}
			canvas.width = width;
			canvas.height = height;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, 0, 0, width, height);
			// 进行压缩
			let compressData = canvas.toDataURL(file.type || 'image/jpeg', quality);
			// 压缩后调用方法进行base64转Blob，方法写在下边
			let blobImg = dataURItoBlob(compressData);
			if (blobImg) {
				let data = {
					blobImg: blobImg,
					base64: compressData
				}
				resolve(data)
			} else {
				reject('hahah')
			}
		})
	})
}

/**
 * base64转Blob对象 
 * @param {dataURI} data -base64格式
 */
function dataURItoBlob(data) {
	let byteString;
	if (data.split(',')[0].indexOf('base64') >= 0) {
		byteString = atob(data.split(',')[1]);
	} else {
		byteString = unescape(data.split(',')[1]);
	}
	let mimeString = data
		.split(',')[0]
		.split(':')[1]
		.split(';')[0];
	let ia = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i += 1) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ia], {
		type: mimeString
	});
}
/**
 * 压缩图片，返回压缩后的File对象
 * @param file {File} - 要压缩的图片File对象
 * @param maxSize {Number}  - 超过多少兆后进行压缩 单位MB
 * @param quality {Number}  - 压缩质量
 * 返回值：{
 *	file:File对象
 *  blob: Blob对象
 *  base64: base64字符串 }
 */
async function getCompressFile(file, maxSize = 0.5, quality = 0.5,width) {
	let size = file.size;
	let isLtMaxSize = size / 1024 / 1024 < maxSize; // 判定图片大小是否小于设定的最大值
	if (!isLtMaxSize) {
		// 不小于500k时压缩图片
		let compressData = await compressUpload(file, quality,width);
		let compressBlob = compressData.blobImg;
		let compressFile = new window.File([compressBlob], file.name, {
			type: compressBlob.type
		});
		return {
			file: compressFile,
			blob: compressBlob,
			base64: compressData.base64
		}
	}
}

export default getCompressFile
