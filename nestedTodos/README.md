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
* Realign delete buttons - their display is inconsistent (non responsive) and not centred.
* Fix multi selection bug: editing a parent todo will also apply edit styles to the child.
* Extend invisible completion checkbox to require less precision when marking as complete.
* Fix incorrect behavior whereby the check all button does not correctly toggle nested/child 
todos that are already marked as complete.
* Fix visual bug when creating a child todo (TAB) when adding a child (click todo -> tab -> tab).
* Make app more responsive.
