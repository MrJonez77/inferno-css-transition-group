const {Component, render, createElement} = window.Inferno;

class Todo extends Component {
	componentWillUnmount() {
		if (this.props.end) {
			this.props.end();
		}
	}

	render({onClick, children}) {
		return createElement(
			'div',
			{
				onClick,
				className: "item"
			},
			children
		);
	}
}

class TodoListWithTimeout extends Component {
	constructor(props, context) {
		super(props, context);

		this.addedIndex = 1;

		this.state = {
			items: ['hello', 'world', 'click', 'me']
		};
	}

	handleAdd(item) {
		let {items} = this.state;
		items = items.concat(item + this.addedIndex);
		this.addedIndex++;
		this.setState({items});
	}

	handleRemove(i) {
		let {items} = this.state;
		items.splice(i, 1);
		this.setState({items});
	}

	render() {
		const toDoItems = this.state.items.map((item, i) => (
			createElement(
				Todo,
				{
					key: item,
					onClick: this.handleRemove.bind(this, i)
				},
				item
			)
		));

		toDoItems.push(
			createElement(
				'button',
				{
					onClick: this.handleAdd.bind(this, 'test')
				},
				'Add'
			)
		);

		return (
			createElement(
				'div',
				null,
				createElement(
					window.InfernoTransitionGroup.CSSTransitionGroup,
					{
						transitionName: "example",
						transitionEnterTimeout: 1000,
						transitionLeaveTimeout: 1000
					},
					toDoItems
				)
			)
		);
	}
}

document.addEventListener("DOMContentLoaded", function() {
	render(createElement(TodoListWithTimeout), document.getElementById('app'));
});
