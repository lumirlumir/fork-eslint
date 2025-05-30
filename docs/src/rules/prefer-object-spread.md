---
title: prefer-object-spread
rule_type: suggestion
---



When `Object.assign` is called using an object literal as the first argument, this rule requires using the object spread syntax instead. This rule also warns on cases where an `Object.assign` call is made using a single argument that is an object literal, in this case, the `Object.assign` call is not needed.

Introduced in ES2018, object spread is a declarative alternative which may perform better than the more dynamic, imperative `Object.assign`.

## Rule Details

Examples of **incorrect** code for this rule:

::: incorrect

```js
/*eslint prefer-object-spread: "error"*/

Object.assign({}, foo);

Object.assign({}, {foo: 'bar'});

Object.assign({ foo: 'bar'}, baz);

Object.assign({}, baz, { foo: 'bar' });

Object.assign({}, { ...baz });

// Object.assign with a single argument that is an object literal
Object.assign({});

Object.assign({ foo: bar });
```

:::

Examples of **correct** code for this rule:

::: correct

```js
/*eslint prefer-object-spread: "error"*/

({ ...foo });

({ ...baz, foo: 'bar' });

// Any Object.assign call without an object literal as the first argument
Object.assign(foo, { bar: baz });

Object.assign(foo, bar);

Object.assign(foo, { bar, baz });

Object.assign(foo, { ...baz });
```

:::

## When Not To Use It

This rule should not be used unless ES2018 is supported in your codebase.
