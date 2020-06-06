# Nested MVC
Based on the open source TodoMVC project (https://github.com/tastejs/todomvc),
this is my version of the jQuery version of that project. I've rewritten the app to remove jQuery,
and extended the Handlebars.js templating to allow unlimited nesting of todos. I've also slightly changed
the style of the app to match my preferences.

## Usage:
Add todos using the field at the top. **Enter** to add todo or confirm any edits.
Mark as complete by clicking to the **left** of any todo.
**Click** a todo to edit. 
**Tab** while editing to create a child todo underneath the current todo.

## Todo:
* Update tests.
* Replace invisiable checkbox with minimal design.
* Make app more responsive.
* limit edit box length when it exceeds the width of the todoapp page.
