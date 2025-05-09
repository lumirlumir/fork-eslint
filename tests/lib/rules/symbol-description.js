/**
 * @fileoverview Tests for symbol-description rule.
 * @author Jarek Rencz
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/symbol-description");
const RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 6,
		sourceType: "script",
	},
});

ruleTester.run("symbol-description", rule, {
	valid: [
		'Symbol("Foo");',
		'var foo = "foo"; Symbol(foo);',

		// Ignore if it's shadowed.
		"var Symbol = function () {}; Symbol();",
		"Symbol(); var Symbol = function () {};",
		"function bar() { var Symbol = function () {}; Symbol(); }",

		// Ignore if it's an argument.
		"function bar(Symbol) { Symbol(); }",
	],

	invalid: [
		{
			code: "Symbol();",
			errors: [
				{
					messageId: "expected",
					type: "CallExpression",
				},
			],
		},
		{
			code: "Symbol(); Symbol = function () {};",
			errors: [
				{
					messageId: "expected",
					type: "CallExpression",
				},
			],
		},
	],
});
