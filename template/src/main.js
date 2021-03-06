// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

function startVue() {
	/* eslint-disable no-new */
	new Vue({
	  el: '#app',
	  router,
	  render: h => h(App)
	});
}

if (window.cordova) {
	document.addEventListener('deviceready', startVue, false);
} else {
	startVue();
}

Vue.config.productionTip = false;
