import Vue from 'vue';
import dialogView from './dialog.vue';
import {
	addClass,
	removeClass,
	getStyle
} from '@/common/js/dom';
import {
	PopupManager
} from '@/common/js/popup/index.js';
import afterLeave from '@/common/js/after-leave.js';
import merge from '@/common/js/merge';

const DialogConstructor = Vue.extend(dialogView);
const defaults = {
	title: "提示",
};

let fullscreenLoading;

DialogConstructor.prototype.originalPosition = '';
DialogConstructor.prototype.originalOverflow = '';

DialogConstructor.prototype.close = function() {
	afterLeave(this, _ => {
		const target = this.body ?
			document.body :
			this.target;
		removeClass(target, 'bx-dialog--relative');
		removeClass(target, 'bx-dialog--hidden');
		if (this.$el && this.$el.parentNode) {
			this.$el.parentNode.removeChild(this.$el);
		}
		this.$destroy();
	}, 300);
	this.visible = false;
};

const addStyle = (options, parent, instance) => {
	let maskStyle = {};
	Object.keys(maskStyle).forEach(property => {
		instance.$el.style[property] = maskStyle[property];
	});
};

const Loading = (options = {}) => {
	if (Vue.prototype.$isServer) return;
	options = merge({}, defaults, options);
	if (typeof options.target === 'string') {
		options.target = document.querySelector(options.target);
	}
	options.target = options.target || document.body;
	let parent = options.body ? document.body : options.target;
	let instance = new DialogConstructor({
		el: document.createElement('div'),
		data: options
	});

	parent.appendChild(instance.$el);
	Vue.nextTick(() => {
		instance.visible = true;
	});
	
	return instance;
};

export default Loading;
