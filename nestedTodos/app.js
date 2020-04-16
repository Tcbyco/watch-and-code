/*global Handlebars */

Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const TAB_KEY = 9;

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
    todoList.todos = JSON.parse(localStorage.getItem('todos'));
    if (!todoList.todos) {
      todoList.todos = [];
    }
  },

  init() {
    this.getTodos();
    // generate HTML templates
    var todoTemplate = document.getElementById('todo-template').innerText;
    view.todoTemplate = Handlebars.compile(todoTemplate);
    
    var footerTemplate = document.getElementById('footer-template').innerText;
    view.footerTemplate = Handlebars.compile(footerTemplate);
    
    handlers.setUpEventListeners();
    view.display();
  },

  indexFromEle(element, todoArray) {
    // This must account for nested todos.

/*  var id = the dataset 'id' from the li parent/ancestor of element;
    var todos = todoList.todos;
    var i = todos.length;

    while (i--) {
      if (todos[i].id === id) {
        return todo object reference;
      } 

      if (todos[i].subTodos) {
        return indexFromEle(element, todos[i].subTodos); 
      }
      
    }
    */
    var id = Number(element.closest('li').dataset.id);
		var todos = todoList.todos;
    var i = todos.length;
    
    while (i--) {
			if (todos[i].id === id) {
        return i;			
      }
		}
  }
}

var todoList = { // is this really the list? Better name?
  todoFilter: 'all', 
  
  addTodo(text) {
    this.todos.push({
      'text': text,
      'id': util.makeId(),
      'completed': false  
    });

    view.display(this.todoFilter);
  },

  deleteTodo(event) {
    var element = event.target;
    var index = util.indexFromEle(element);
    this.todos.splice(index, 1);

    util.storeTodos();
    view.display();
  },

  deleteCompleted() {
    var activeTodos = this.filterTodos('active');
    this.todos = activeTodos;
    util.storeTodos();
    view.display();
  },

  changeTodo(index, newText) {
    this.todos[index].text = newText;
  },

  toggleCompleted(e) {
    /* This must factor in nested todos.
    var index = util.indexFromEle(e);
    var todos = this.todos;
     */
    var element = e.target;
    var index = util.indexFromEle(element);
    this.todos[index].completed = !this.todos[index].completed;
    view.display();
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

    util.storeTodos();
    view.display();
  },
  
  filterTodos(filter) { // deprecated
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

  getActiveTodos() {
    return this.todos.filter(function(todo){
      return !todo.completed;
    })
  }

}

var handlers = {
  setUpEventListeners() {
    // grab buttons that need event listeners.
    var toggleAllButton = document.getElementById('toggle-all');
    var footer = document.getElementById('footer');
    var newTodoField = document.getElementById('new-todo');
    var todoUl = document.getElementById('todo-list');

    toggleAllButton.addEventListener('click', todoList.toggleAll.bind(todoList));
    newTodoField.addEventListener('change', handlers.addTodoAndResetInput.bind(this));
    
    todoUl.addEventListener('click', function(event) {
      if (event.target.className === 'delete') {
        todoList.deleteTodo(event);
      }
    }.bind(this));

    todoUl.addEventListener('change', function(event) {
      if (event.target.className === 'toggle') {
        todoList.toggleCompleted(event);
      }
    }.bind(this));

    todoUl.addEventListener('dblclick', function(event){
      if (event.target.nodeName === 'LABEL') {
        view.showEditBox(event);
      }
    }.bind(view));

    todoUl.addEventListener('keyup', function(event){
      if (event.target.className === 'edit') {
        handlers.checkIfExitingEditMode(event);
      }
    }.bind(this));

    todoUl.addEventListener('focusout', function(event){
      if (event.target.className === 'edit') {
        handlers.saveOrDiscardEdits(event);
      }
    }.bind(this));

    footer.addEventListener('click', function(event){
      if (event.target.nodeName === 'BUTTON') {
        todoList.deleteCompleted();
      }
    }.bind(todoList));
  },

  handleEdits(e) { // e = focusout
    var element = e.target;
    var newText = element.value;
    var index = util.indexFromEle(element);
    var todos = todoList.todos;

    if (newText === '') {
      todoList.deleteTodo(todoIndex);
      
      util.storeTodos();
      view.display();
    } else {
      todos[index].text = newText;
      util.storeTodos();
      view.display();
    }
  },

  checkIfExitingEditMode: function (e) {
    if (e.which === ENTER_KEY) {
      e.target.blur();
    }

    if (e.which === ESCAPE_KEY) {
      e.target.dataset.abort = 'true';
      e.target.blur();
    }
  },

  saveOrDiscardEdits: function (e) {
    var el = e.target;
    var val = el.value.trim();
    var index = util.indexFromEle(el);

    if (!val) {
      todoList.deleteTodo(e);
      view.display();
      return;
    }

    if (el.dataset.abort === 'true') {
      el.dataset.abort = 'false';
    } else {
      todoList.todos[index].text = val;
    }

    util.storeTodos();
    view.display();
  },
  
  addTodoAndResetInput(e) { // e = change event
    todoList.addTodo(e.target.value);
    e.target.value = '';
  }
}

var view = {
  getBody(filteredTodos) {
    var todoHTML = this.todoTemplate(filteredTodos);
    return todoHTML;
  },

  getFooter() {
    var todoCount = todoList.todos.length;
    var activeTodoCount = todoList.getActiveTodos().length;
    var footerHTML = this.footerTemplate({
      completedTodos: todoCount - activeTodoCount,
    });
    return footerHTML;
  },

  display() {
    var todos = todoList.todos;
    var todoUl = document.getElementById('todo-list');
    var footer = document.getElementById('footer');
    var bodyHTML = this.getBody(todos);
    var footerHTML = this.getFooter();
    var newTodoField = document.getElementById('new-todo');

    todoUl.innerHTML = bodyHTML;
    footer.innerHTML = footerHTML;
    newTodoField.focus();
    console.log(todos);
  },

  showEditBox(e) { // e = dblclick
    var inputField = e.target.closest('li');
    inputField.className = 'editing';
    inputField.querySelector('.edit').focus();
  } 
}

util.init();

// Pressing ENTER when the cursor is focused on a todo should shift the cursor to a new empty todo below the current one
// Pressing TAB at the beginning or end of a todotext input should indent that todo.
// Indenting a todo should also indent any nested todos at the same time.

