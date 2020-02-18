var util = {
  'id': 0,
  makeId: function() {
    this.id ++;
    return this.id; 
  }
}

var todoList = {
  'todos': [],
  
  'addTodo': function(text) {
    this.todos.push({
      'text': text,
      'id': util.makeId(),
      'completed': false  
  });
  },

  'deleteTodo': function(index) {
    this.todos.splice(index, 1);
  },

  'changeTodo': function(index, newText) {
    this.todos[index].text = newText;
  },

  'toggleCompleted': function(index) {
    this.todos[index].completed = !this.todos[index].completed;
  }
}

// 'It should store todos in localStorage'
localStorage.setItem('todos', JSON.stringify(todoList.todos));
