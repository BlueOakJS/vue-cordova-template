import '../.setupVueTest';
import { mount } from 'vue-test';
import Hello from 'src/components/Hello';

describe('Hello.vue', () => {
	it('should mount', () => {
		const HelloComponent = mount(Hello);
		HelloComponent.should.be.ok;
		HelloComponent.should.have.className('hello');
	});

  it('should render correct contents', () => {
		const HelloComponent = mount(Hello);
		HelloComponent.find('.hello h1').text().
			should.equal('Welcome to Your Cordova Vue.js App');
  });
});
