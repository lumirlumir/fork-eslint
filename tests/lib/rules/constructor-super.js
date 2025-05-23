/**
 * @fileoverview Tests for constructor-super rule.
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/constructor-super");
const RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2021 } });

ruleTester.run("constructor-super", rule, {
	valid: [
		// non derived classes.
		"class A { }",
		"class A { constructor() { } }",

		/*
		 * inherit from non constructors.
		 * those are valid if we don't define the constructor.
		 */
		"class A extends null { }",

		// derived classes.
		"class A extends B { }",
		"class A extends B { constructor() { super(); } }",
		"class A extends B { constructor() { if (true) { super(); } else { super(); } } }",
		"class A extends (class B {}) { constructor() { super(); } }",
		"class A extends (B = C) { constructor() { super(); } }",
		"class A extends (B &&= C) { constructor() { super(); } }",
		"class A extends (B ||= C) { constructor() { super(); } }",
		"class A extends (B ??= C) { constructor() { super(); } }",
		"class A extends (B ||= 5) { constructor() { super(); } }",
		"class A extends (B ??= 5) { constructor() { super(); } }",
		"class A extends (B || C) { constructor() { super(); } }",
		"class A extends (5 && B) { constructor() { super(); } }",

		// A future improvement could detect the left side as statically falsy, making this invalid.
		"class A extends (false && B) { constructor() { super(); } }",
		"class A extends (B || 5) { constructor() { super(); } }",
		"class A extends (B ?? 5) { constructor() { super(); } }",

		"class A extends (a ? B : C) { constructor() { super(); } }",
		"class A extends (B, C) { constructor() { super(); } }",

		// nested.
		"class A { constructor() { class B extends C { constructor() { super(); } } } }",
		"class A extends B { constructor() { super(); class C extends D { constructor() { super(); } } } }",
		"class A extends B { constructor() { super(); class C { constructor() { } } } }",

		// multi code path.
		"class A extends B { constructor() { a ? super() : super(); } }",
		"class A extends B { constructor() { if (a) super(); else super(); } }",
		"class A extends B { constructor() { switch (a) { case 0: super(); break; default: super(); } } }",
		"class A extends B { constructor() { try {} finally { super(); } } }",
		"class A extends B { constructor() { if (a) throw Error(); super(); } }",

		// returning value is a substitute of 'super()'.
		"class A extends B { constructor() { if (true) return a; super(); } }",
		"class A extends null { constructor() { return a; } }",
		"class A { constructor() { return a; } }",

		// https://github.com/eslint/eslint/issues/5261
		"class A extends B { constructor(a) { super(); for (const b of a) { this.a(); } } }",
		"class A extends B { constructor(a) { super(); for (b in a) ( foo(b) ); } }",

		// https://github.com/eslint/eslint/issues/5319
		"class Foo extends Object { constructor(method) { super(); this.method = method || function() {}; } }",

		// https://github.com/eslint/eslint/issues/5394
		[
			"class A extends Object {",
			"    constructor() {",
			"        super();",
			"        for (let i = 0; i < 0; i++);",
			"    }",
			"}",
		].join("\n"),
		[
			"class A extends Object {",
			"    constructor() {",
			"        super();",
			"        for (; i < 0; i++);",
			"    }",
			"}",
		].join("\n"),
		[
			"class A extends Object {",
			"    constructor() {",
			"        super();",
			"        for (let i = 0;; i++) {",
			"            if (foo) break;",
			"        }",
			"    }",
			"}",
		].join("\n"),
		[
			"class A extends Object {",
			"    constructor() {",
			"        super();",
			"        for (let i = 0; i < 0;);",
			"    }",
			"}",
		].join("\n"),
		[
			"class A extends Object {",
			"    constructor() {",
			"        super();",
			"        for (let i = 0;;) {",
			"            if (foo) break;",
			"        }",
			"    }",
			"}",
		].join("\n"),

		// https://github.com/eslint/eslint/issues/8848
		`
            class A extends B {
                constructor(props) {
                    super(props);

                    try {
                        let arr = [];
                        for (let a of arr) {
                        }
                    } catch (err) {
                    }
                }
            }
        `,

		// Optional chaining
		"class A extends obj?.prop { constructor() { super(); } }",

		`
            class A extends Base {
                constructor(list) {
                    for (const a of list) {
                        if (a.foo) {
                            super(a);
                            return;
                        }
                    }
                    super();
                }
            }
        `,
	],
	invalid: [
		// inherit from non constructors.
		{
			code: "class A extends null { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends null { constructor() { } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: "class A extends 100 { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends 'test' { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B = 5) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B && 5) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			// `B &&= 5` evaluates either to a falsy value of `B` (which, then, cannot be a constructor), or to '5'
			code: "class A extends (B &&= 5) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B += C) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B -= C) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B **= C) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B |= C) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},
		{
			code: "class A extends (B &= C) { constructor() { super(); } }",
			errors: [{ messageId: "badSuper", type: "CallExpression" }],
		},

		// derived classes.
		{
			code: "class A extends B { constructor() { } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { for (var a of b) super.foo(); } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { for (var i = 1; i < 10; i++) super.foo(); } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},

		// nested execution scope.
		{
			code: "class A extends B { constructor() { var c = class extends D { constructor() { super(); } } } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { var c = () => super(); } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { class C extends D { constructor() { super(); } } } }",
			errors: [
				{
					messageId: "missingAll",
					type: "MethodDefinition",
					column: 21,
				},
			],
		},
		{
			code: "class A extends B { constructor() { var C = class extends D { constructor() { super(); } } } }",
			errors: [
				{
					messageId: "missingAll",
					type: "MethodDefinition",
					column: 21,
				},
			],
		},
		{
			code: "class A extends B { constructor() { super(); class C extends D { constructor() { } } } }",
			errors: [
				{
					messageId: "missingAll",
					type: "MethodDefinition",
					column: 66,
				},
			],
		},
		{
			code: "class A extends B { constructor() { super(); var C = class extends D { constructor() { } } } }",
			errors: [
				{
					messageId: "missingAll",
					type: "MethodDefinition",
					column: 72,
				},
			],
		},

		// lacked in some code path.
		{
			code: "class A extends B { constructor() { if (a) super(); } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { if (a); else super(); } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { a && super(); } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { switch (a) { case 0: super(); } } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { switch (a) { case 0: break; default: super(); } } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { try { super(); } catch (err) {} } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { try { a; } catch (err) { super(); } } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
		{
			code: "class A extends B { constructor() { if (a) return; super(); } }",
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},

		// duplicate.
		{
			code: "class A extends B { constructor() { super(); super(); } }",
			errors: [
				{ messageId: "duplicate", type: "CallExpression", column: 46 },
			],
		},
		{
			code: "class A extends B { constructor() { super() || super(); } }",
			errors: [
				{ messageId: "duplicate", type: "CallExpression", column: 48 },
			],
		},
		{
			code: "class A extends B { constructor() { if (a) super(); super(); } }",
			errors: [
				{ messageId: "duplicate", type: "CallExpression", column: 53 },
			],
		},
		{
			code: "class A extends B { constructor() { switch (a) { case 0: super(); default: super(); } } }",
			errors: [
				{ messageId: "duplicate", type: "CallExpression", column: 76 },
			],
		},
		{
			code: "class A extends B { constructor(a) { while (a) super(); } }",
			errors: [
				{ messageId: "missingSome", type: "MethodDefinition" },
				{ messageId: "duplicate", type: "CallExpression", column: 48 },
			],
		},

		// ignores `super()` on unreachable paths.
		{
			code: "class A extends B { constructor() { return; super(); } }",
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},

		// https://github.com/eslint/eslint/issues/8248
		{
			code: `class Foo extends Bar {
                constructor() {
                    for (a in b) for (c in d);
                }
            }`,
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},

		{
			code: `class C extends D {

                constructor() {
                    do {
                        something();
                    } while (foo);
                }

            }`,
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: `class C extends D {

                constructor() {
                    for (let i = 1;;i++) {
                        if (bar) {
                            break;
                        }
                    }
                }

            }`,
			errors: [{ messageId: "missingAll", type: "MethodDefinition" }],
		},
		{
			code: `class C extends D {

                constructor() {
                    do {
                        super();
                    } while (foo);
                }

            }`,
			errors: [{ messageId: "duplicate", type: "CallExpression" }],
		},
		{
			code: `class C extends D {

                constructor() {
                    while (foo) {
                        if (bar) {
                            super();
                            break;
                        }
                    }
                }

            }`,
			errors: [{ messageId: "missingSome", type: "MethodDefinition" }],
		},
	],
});
