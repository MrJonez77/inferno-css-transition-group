import './polyfill';
import {Component, render} from 'inferno';
import {CSSTransitionGroup} from './../src/index';
import './style.css';

/* global expect */

class Todo extends Component {
	componentWillUnmount() {
		if (this.props.end) {
			this.props.end();
		}
	}

	render({onClick, children}) {
		return <div onClick={onClick} class="item">{children}</div>;
	}
}

Todo.defaultProps = {
	end: () => {}
};

class TodoListWithTimeout extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			items: ['hello', 'world', 'click', 'me']
		};
	}

	handleAdd(item) {
		let {items} = this.state;
		items = items.concat(item);
		this.setState({items});
	}

	handleRemove(i) {
		let {items} = this.state;
		items.splice(i, 1);
		this.setState({items});
	}

	render() {
		const toDoItems = this.state.items.map((item, i) => (
			<Todo key={item} onClick={this.handleRemove.bind(this, i)}>
				{item}
			</Todo>
		));

		return (
			<div>
				<CSSTransitionGroup
					transitionName="example"
					transitionEnterTimeout={1000}
					transitionLeaveTimeout={1000}>
					{toDoItems}
				</CSSTransitionGroup>
			</div>
		);
	}
}

class SVGList extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			items: ['hello', 'world', 'click', 'me']
		};
	}

	handleAdd(item) {
		let {items} = this.state;
		items = items.concat(item);
		this.setState({items});
	}

	handleRemove(i) {
		let {items} = this.state;
		items.splice(i, 1);
		this.setState({items});
	}

	render() {
		const toDoItems = this.state.items.map((item, i) => (
			<Todo key={item} onClick={this.handleRemove.bind(this, i)}>
				{item}
			</Todo>
		));

		return (
			<svg>
				<CSSTransitionGroup
					transitionName="example"
					transitionEnterTimeout={1000}
					transitionLeaveTimeout={1000}
					component="g">
					{toDoItems}
				</CSSTransitionGroup>
			</svg>
		);
	}
}

class NullChildren extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			items: [
				{displayed: true, item: 'hello'},
				{displayed: true, item: 'world'},
				{displayed: false, item: 'click'},
				{displayed: true, item: 'me'}
			]
		};
	}

	toggleDisplay(i) {
		let {items} = this.state;
		const item = items[i];
		item.displayed = !item.displayed;
		this.setState({items});
	}

	render() {
		const toDoItems = this.state.items.map( ({displayed, item}, i) => (
			displayed ? <Todo key={item} onClick={this.toggleDisplay.bind(this, i)}>{item}</Todo> : null
		));

		return (
			<div className='root'>
				<CSSTransitionGroup
					transitionName="example"
					transitionEnterTimeout={1000}
					transitionLeaveTimeout={1000}>
					{toDoItems}
				</CSSTransitionGroup>
			</div>
		);
	}
}

const Nothing = () => null;

describe('CSSTransitionGroup with timeout', () => {
	let container = document.createElement('div'),
		list;
	document.body.appendChild(container);

	let $ = s => [].slice.call(container.querySelectorAll(s));

	beforeEach( () => {
		render(<div><Nothing/></div>, container);
		render(<div><TodoListWithTimeout ref={c => {if (c) {list = c;}}} /></div>, container);
	});

	afterEach( () => {
		list = null;
	});

	it('create works', () => {
		expect($('.item')).to.have.length(4);
	});

	it('transitionLeave works with the transitionLeaveTimeout', done => {
		// this.timeout(5999);
		list.handleRemove(0);

		// make sure -leave class was added
		setTimeout( () => {
			expect($('.item')).to.have.length(4);

			expect($('.item')[0].className).to.contain('example-leave');
			expect($('.item')[0].className).to.contain('example-leave-active');
		}, 100);

		// then make sure it's gone
		setTimeout( () => {
			expect($('.item')).to.have.length(3);
			done();
		}, 1400);
	});

	it('transitionEnter works with the transitionEnterTimeout', done => {
		// this.timeout(5999);
		list.handleAdd(Date.now());

		setTimeout( () => {
			expect($('.item')).to.have.length(5);

			expect($('.item')[4].className).to.contain('example-enter');
			expect($('.item')[4].className).to.contain('example-enter-active');
		}, 100);

		setTimeout( () => {
			expect($('.item')).to.have.length(5);

			expect($('.item')[4].className).not.to.contain('example-enter');
			expect($('.item')[4].className).not.to.contain('example-enter-active');

			done();
		}, 1400);
	});
});

describe('CSSTransitionGroup: SVG', () => {
	let container = document.createElement('div'),
		list;
	document.body.appendChild(container);

	let $ = s => [].slice.call(container.querySelectorAll(s));

	beforeEach( () => {
		render(<div><Nothing /></div>, container);
		render(<div><SVGList ref={c => {if (c) {list = c;}}} /></div>, container);
	});

	afterEach( () => {
		list = null;
	});

	it('create works', () => {
		expect($('.item')).to.have.length(4);
	});

	it('transitionLeave works', done => {
		list.handleRemove(0);

		setTimeout( () => {
			expect($('.item')).to.have.length(4);

			expect($('.item')[0].classList.contains('example-leave'));
			expect($('.item')[0].classList.contains('example-leave-active'));
		}, 100);

		setTimeout( () => {
			expect($('.item')).to.have.length(3);
			done();
		}, 1400);
	});

	it('transitionEnter works', done => {
		list.handleAdd(Date.now());

		setTimeout( () => {
			expect($('.item')).to.have.length(5);

			expect($('.item')[4].classList.contains('example-enter'));
			expect($('.item')[4].classList.contains('example-enter-active'));
		}, 100);

		setTimeout( () => {
			expect($('.item')).to.have.length(5);

			expect(!$('.item')[4].classList.contains('example-enter'));
			expect(!$('.item')[4].classList.contains('example-enter-active'));

			done();
		}, 1400);
	});
});

describe('CSSTransitionGroup: NullChildren', () => {
	let container = document.createElement('div'),
		list;
	document.body.appendChild(container);

	let $ = s => [].slice.call(container.querySelectorAll(s));

	beforeEach( () => {
		render(<div><Nothing /></div>, container);
		render(<div><NullChildren ref={c => {if (c) {list = c;}}} /></div>, container);
	});

	afterEach( () => {
		list = null;
	});

	it('create works', () => {
		expect($('.item')).to.have.length(3);
	});

	it('transitionLeave works', done => {
		// this.timeout(5999);
		list.toggleDisplay(1);

		// make sure -leave class was added
		setTimeout( () => {
			expect($('.item')).to.have.length(3);

			expect($('.item')[1].className).to.contain('example-leave');
			expect($('.item')[1].className).to.contain('example-leave-active');
		}, 100);

		// then make sure it's gone
		setTimeout( () => {
			expect($('.item')).to.have.length(2);
			done();
		}, 1400);
	});

	it('transitionEnter works', done => {
		// this.timeout(5999);
		list.toggleDisplay(2);

		setTimeout( () => {
			expect($('.item')).to.have.length(4);
			expect($('.item')[2].className).to.contain('example-enter');
			expect($('.item')[2].className).to.contain('example-enter-active');
		}, 100);

		setTimeout( () => {
			expect($('.item')).to.have.length(4);

			expect($('.item')[3].className).not.to.contain('example-enter');
			expect($('.item')[3].className).not.to.contain('example-enter-active');

			done();
		}, 1400);
	});
});
