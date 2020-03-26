var util = {
  'id': 0,
  makeId() {
    this.id ++;
    return this.id; 
  },

  storeTodos() {
    localStorage.setItem('todos', JSON.stringify(todoList.todos));
  },

  getTodos() {
    localStorage.getItem('todos');
  }
}

var todoList = {
  todos: [],
  todoFilter: 'all', /* eventually this will refer to current web address*/
  
  addTodo(text) {
    this.todos.push({
      'text': text,
      'id': util.makeId(),
      'completed': false  
    });
  },

  deleteTodo(index) {
    this.todos.splice(index, 1);
  },

  deleteCompleted() {
    var activeTodos = this.filterTodos('active');
    this.todos = activeTodos;
  },

  changeTodo(index, newText) {
    this.todos[index].text = newText;
  },

  toggleCompleted(index) {
    this.todos[index].completed = !this.todos[index].completed;
  },

  toggleAll() {
    var listLength = this.todos.length;
    var numCompleted = 0;
    
    this.todos.forEach(function(todo) {
      if (todo.completed) {
        numCompleted++;
      }
    });

    var everythingTrue = numCompleted === listLength;
    var toggleValue = everythingTrue ? false : true;

    this.todos.forEach(function(todo) {
      todo.completed = toggleValue;
    });
  },
  
  filterTodos(filter) {
    // set the filter to be whatever we passed in. Should this be here?
    this.todoFilter = filter;
    
    // create a filtered todo array that matches the filter
    var filteredTodos = this.todos.filter(function(todo){
      if (filter === 'all') {
        return true;
      }
  
      if (filter === 'active') {
        if (!todo.completed) {
          return true;
        }
      }
  
      if (filter === 'completed') {
        if (todo.completed) {
          return true;
        }
      }
    });
    return filteredTodos;
  },

}

var handlers = {
  setUpEventListeners() {
    // grab buttons that need event listeners.
    var toggleAllButton = document.querySelector('#toggleAll');
    var deleteCompletedButton = document.querySelector('#deleteCompleted');
    var filterAllButton = document.querySelector('#filterAll');
    var filterActiveButton = document.querySelector('#filterActive');
    var filterCompletedButton = document.querySelector('#filterCompleted');


    toggleAllButton.addEventListener('click', todoList.toggleAll.bind(todoList));
    deleteCompletedButton.addEventListener('click', todoList.deleteCompleted.bind(todoList));
    filterAllButton.addEventListener('click', view.display.bind(view, 'all'));
    filterActiveButton.addEventListener('click', view.display.bind(view, 'active'));
    filterCompletedButton.addEventListener('click', view.display.bind(view, 'completed'));
  }
}

var view = {
  display(filter) {
    console.log(todoList.filterTodos(filter));
    // filter todos
    // pass filtered todos into handlebars template
    // inject template into document
  },
}

handlers.setUpEventListeners();

// DONE It should have a button for toggling todos
// DONE It should have a button to delete completed todos
// DONE There should be a data structure for the todos we are 'viewing'
// There should be a <li> for every todo
// Each <li> should contain todoText
// It should have a method for deleting completed todos.
// Clicking the buttons should run their associated methods
// It should have a field to enter todos
// It should have a delete button for each todo
// Clicking the delete button should run deleteTodo
// Double clicking a todo should allow you to edit it.
// It should cross out completed todos
// It should store todos in localStorage
// The app should initialise by pulling todos from storage.
// the app should update storage whenever the todo list changes.
// Pressing ENTER when the cursor is focused on a non-empty input field should add that todo
// Pressing ENTER when the cursor is focused on a todo should shift the cursor to a new empty todo below the current one
// Pressing TAB at the beginning or end of a todotext input should indent that todo.
// Indenting a todo should also indent any nested todos at the same time.
// filter should be linked to page address: #all, #completed, #active
