import Vue from 'vue';
import loadingVue from './loading.vue';
import { addClass, removeClass, getStyle } from '@/common/js/dom';
import { PopupManager } from '@/common/js/popup/index.js';
import afterLeave from '@/common/js/after-leave.js';
import merge from '@/common/js/merge';

const LoadingConstructor = Vue.extend(loadingVue);

const defaults = {
  text: null,
  body: false,
  lock: false,
  customClass: '',
	fullscreen: true
};

let fullscreenLoading;

LoadingConstructor.prototype.originalPosition = '';
LoadingConstructor.prototype.originalOverflow = '';

LoadingConstructor.prototype.close = function() {
  afterLeave(this, _ => {
    const target = this.body
      ? document.body
      : this.target;
    removeClass(target, 'el-loading-parent--relative');
    removeClass(target, 'el-loading-parent--hidden');
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    this.$destroy();
  }, 300);
  this.visible = false;
};

const addStyle = (options, parent, instance) => {
  let maskStyle = {};
  // if (options.fullscreen) {
  //   instance.originalPosition = getStyle(document.body, 'position');
  //   instance.originalOverflow = getStyle(document.body, 'overflow');
  //   // maskStyle.zIndex = PopupManager.nextZIndex();
  // } else if (options.body) {
  //   instance.originalPosition = getStyle(document.body, 'position');
  //   ['top', 'left'].forEach(property => {
  //     let scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
  //     maskStyle[property] = options.target.getBoundingClientRect()[property] +
  //       document.body[scroll] +
  //       document.documentElement[scroll] +
  //       'px';
  //   });
  //   ['height', 'width'].forEach(property => {
  //     maskStyle[property] = options.target.getBoundingClientRect()[property] + 'px';
  //   });
  // } else {
  //   instance.originalPosition = getStyle(parent, 'position');
  // }
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
  // if (options.target !== document.body) {
  //   options.fullscreen = false;
  // } else {
  //   options.body = true;
  // }
  // if (options.fullscreen && fullscreenLoading) {
  //   return fullscreenLoading;
  // }

  let parent = options.body ? document.body : options.target;
  let instance = new LoadingConstructor({
    el: document.createElement('div'),
    data: options
  });

  // addStyle(options, parent, instance);

  parent.appendChild(instance.$el);
  Vue.nextTick(() => {
    instance.visible = true;
  });
  // if (options.fullscreen) {
  //   fullscreenLoading = instance;
  // }
  return instance;
};

export default Loading;
