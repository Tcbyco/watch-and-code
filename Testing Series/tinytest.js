/**
 * Very simple in-browser unit-test library, with zero deps.
 *
 * Background turns green if all tests pass, otherwise red.
 * View the JavaScript console to see failure reasons.
 *
 * Example:
 *
 *   adder.js (code under test)
 *
 *     function add(a, b) {
 *       return a + b;
 *     }
 *
 *   adder-test.html (tests - just open a browser to see results)
 *
 *     <script src="tinytest.js"></script>
 *     <script src="adder.js"></script>
 *     <script>
 *
 *     tests({
 *
 *       'adds numbers': function() {
 *         eq(6, add(2, 4));
 *         eq(6.6, add(2.6, 4));
 *       },
 *
 *       'subtracts numbers': function() {
 *         eq(-2, add(2, -4));
 *       },
 *
 *     });
 *     </script>
 *
 * That's it. Stop using over complicated frameworks that get in your way.
 *
 * -Joe Walnes
 * MIT License. See https://github.com/joewalnes/jstinytest/
 */

 // My questions:
 // Why do we run each test with apply? In other words, what is the purpose 
 // of setting 'this' to TinyTest, given that the testing methods are 
 // already declared as variables outside the object? We don't need to 
 // use 'this'...right? 

 // Difference between document (in global) and window.document (also global).
 // Why we check for both (specifically, window.document and document.body).
 // I assume you cannot have document.body without document existing. 
 // It also appears that document exists before the DOM updates. So why check
 // for it?
var TinyTest = {

    run: function(tests) {
        var failures = 0;
        for (var testName in tests) {
            var testAction = tests[testName];
            try {
                // why apply this?
                testAction.apply(this);
                console.log('Test:', testName, 'OK');
            } catch (e) {
                failures++;
                console.error('Test:', testName, 'FAILED', e);
                console.error(e.stack);
            }
        }

        // ? The if statement will always return true since setTimeout
        // runs after the DOM has updated. So might as well not have it?
        setTimeout(function() { // Give document a chance to complete
            //if (window.document && document.body) {
                document.body.style.backgroundColor = (failures == 0 ? '#99ff99' : '#ff9999');
           // }
        }, 0);
    },

    fail: function(msg) {
        throw new Error('fail(): ' + msg);
    },

    assert: function(value, msg) {
        if (!value) {
            throw new Error('assert(): ' + msg);
        }
    },

    assertEquals: function(expected, actual) {
        if (expected != actual) {
            throw new Error('assertEquals() "' + expected + '" != "' + actual + '"');
        }
    },

    assertStrictEquals: function(expected, actual) {
        if (expected !== actual) {
            throw new Error('assertStrictEquals() "' + expected + '" !== "' + actual + '"');
        }
    },

};

var fail               = TinyTest.fail.bind(TinyTest),
    assert             = TinyTest.assert.bind(TinyTest),
    assertEquals       = TinyTest.assertEquals.bind(TinyTest),
    eq                 = TinyTest.assertEquals.bind(TinyTest), // alias for assertEquals
    assertStrictEquals = TinyTest.assertStrictEquals.bind(TinyTest),
    tests              = TinyTest.run.bind(TinyTest);