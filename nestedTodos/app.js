/*global Handlebars */

/*Inspired by the jQuery version of the open source Todo MVC project: 
https://github.com/tastejs/todomvc/tree/master/examples/jquery
Rewritten to use vanilla JS. Implimented a nested todos feature. 
Slight visual changes. 
*/


Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const TAB_KEY = 9;

var util = {
  makeId() {
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
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

  getTodoFromId(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
            return array[i];
        }
        if (array[i].todos.length > 0) {
          var found = util.getTodoFromId(array[i].todos, id);
          if (found) {
            return found;
        }
      }
    }
  }
}

var todoList = { 
  
  addTodo(text) {
    this.todos.push({
      'text': text,
      'id': util.makeId(),
      'completed': false,
      'todos': [],
    });

    view.display();
  },

  addEmptySubTodo(parentElement) {
    var parentId = parentElement.dataset.id;
    var parentTodo = util.getTodoFromId(this.todos, parentId);
    var blankTodo = {
      'text': '',
      'id': util.makeId(), 
      'completed': false,
      'todos': [],
      
    };
    parentTodo.todos.push(blankTodo);
    return blankTodo.id; // for use when selecting this immediately after creation
  },

  deleteTodo(event) {
    var deleteButton = event.target;
    var id = deleteButton.closest('li').dataset.id;
    // recursively filter sub todo out of array
    todoList.todos = todoList.todos.filter(
      function rebuildTodos(value, index, array){
        if (value.id === id) {
          return false;
        } else if (value.todos.length > 0) {
          value.todos = value.todos.filter(rebuildTodos);
        }
        return true;
      });

    util.storeTodos();
    view.display();
  },

  deleteCompleted() {
    var activeTodos = this.getActiveTodos();
    this.todos = activeTodos;
    util.storeTodos();
    view.display();
  },

  toggleCompleted(e) {
    var element = e.target;
    var id = element.closest('li').dataset.id;
    var todo = util.getTodoFromId(todoList.todos, id);
    todo.completed = !todo.completed;
    view.display();
  },

  toggleAll() {
    let anyIncomplete = todoList.todos.some(function check(todo){
      if (todo.todos.length === 0) {
        return !todo.completed;
      } else {
        return todo.todos.some(check) || !todo.completed;
      }
    });

    let toggleValue = anyIncomplete ? true : false;
    
    todoList.todos = todoList.todos.map(function toggle(todo){
      todo.completed = toggleValue;
      if (todo.todos.length > 0) {
        todo.todos = todo.todos.map(toggle);
      }
      return todo;
    });

    util.storeTodos();
    view.display();
  },

  getActiveTodos() {
    return this.todos.filter(function filt(todo){
        if (todo.todos.length > 0) { // filter sub todos
          todo.todos = todo.todos.filter(filt);
        }
        if (!todo.completed) {
          return true;
        }
    });
  }
}

var handlers = {
  setUpEventListeners() {
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
      if (event.target.nodeName === 'LABEL') {
        view.showEditBox(event.target.closest('li'));
      }
    }.bind(this));

    todoUl.addEventListener('change', function(event) {
      if (event.target.className === 'toggle') {
        todoList.toggleCompleted(event);
      }
    }.bind(this));

    todoUl.addEventListener('dblclick', function(event){
      if (event.target.nodeName === 'LABEL') {
        view.showEditBox(event.target.closest('li'));
      }
    }.bind(view));

    todoUl.addEventListener('keydown', function(event){
      if (event.target.className === 'edit') {
        if (event.which === TAB_KEY) {
          event.preventDefault();
        }
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

  checkIfExitingEditMode: function (e) {
    if (e.which === ENTER_KEY) {
      e.target.blur();
    }

    if (e.which === ESCAPE_KEY) {
      e.target.dataset.abort = 'true';
      e.target.blur(); // will trigger saveOrDiscardEdits
    }

    if (e.which === TAB_KEY) {
      let val = e.target.value.trim();
      if (val) {
        e.target.blur(); // Save any text to the current todo
        // Make a new empty todo under the current one.
        let id = todoList.addEmptySubTodo(e.target.closest('li'))
        view.display();
        // Find the empty todo that we just created.
        let searchString = '[data-id="' + id + '"]'; // interpolation issues, resorted to string concat
        let li = document.querySelector(searchString);
        // Open the edit view for the empty todo.
        view.showEditBox(li);
      }
    }
  },

  saveOrDiscardEdits: function (e) {
    var el = e.target;
    var val = el.value.trim();
    var id = el.closest('li').dataset.id;
    var todo = util.getTodoFromId(todoList.todos, id);

    if (!val) {
      todoList.deleteTodo(e);
      view.display();
      return;
    }

    if (el.dataset.abort === 'true') {
      el.dataset.abort = 'false';
    } else {
     todo.text = val;
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
  getBody(todoArray) {
    var script = document.getElementById('todo-template').innerText;
    var todoTemplate = Handlebars.compile(script);
    var recursiveScript = document.getElementById('recursive-list').innerText;
    Handlebars.registerPartial("list", recursiveScript);
    
    var todoHTML = todoTemplate({ todos: todoArray })
    return todoHTML;
  },

  getFooter() {
    let anyCompleted = todoList.todos.some(function anyComplete(todo){
      if (todo.todos.length === 0) {
        return todo.completed;
      } else {
        return todo.todos.every(anyComplete) || todo.completed;
      }
    });
    let footerHTML = this.footerTemplate({
      anyCompletedTodos: anyCompleted
    });
    return footerHTML;
  },

  display() {
    var todos = todoList.todos;
    var todoUl = document.getElementById('todo-list');
    var footer = document.getElementById('footer');
    var bodyHTML = this.getBody(todos);
    var footerHTML = this.getFooter();

    todoUl.innerHTML = bodyHTML;
    footer.innerHTML = footerHTML;
    util.storeTodos();
  },

  showEditBox(liElement) { 
    liElement.className = 'editing';
    liElement.querySelector('.edit').focus();
  } 
}

util.init();

