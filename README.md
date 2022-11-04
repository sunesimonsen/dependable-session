# @dependable/session

[![Checks](https://github.com/sunesimonsen/dependable-session/workflows/CI/badge.svg)](https://github.com/sunesimonsen/dependable-session/actions?query=workflow%3ACI+branch%3Amain)
[![Bundle Size](https://img.badgesize.io/https:/unpkg.com/@dependable/session/dist/dependable-session.esm.min.js?label=gzip&compression=gzip)](https://unpkg.com/@dependable/session/dist/dependable-session.esm.min.js)

Save and restore [@dependable/state](https://github.com/sunesimonsen/dependable-state) to session storage.

[API documentation](https://dependable-session-api.surge.sh/modules.html)

## Install

```sh
# npm
npm install --save @dependable/session

# yarn
yarn add @dependable/session
```

## Usage

You can store the current [@dependable/state](https://github.com/sunesimonsen/dependable-state) into session storage the following way.

Only observables with id's will be stored, but if those observables contains other observables, those will be stored as well.

Notice that your observable can only contain JSON serializable data and other observables.

```js
import { observable } from "@dependable/state";
import { saveSession } from "@dependable/session";

const name = observable("Jane Doe", { id: "name" });

name("John Doe");

saveSession();
```

After a browser reload you can restore the session this way.

```js
import { restoreSession } from "@dependable/session";
import { observable } from "@dependable/state";

restoreSession();

const name = observable("Jane Doe", { id: "name" });
```

Now the name will actually be _John Doe_ as that was the initial value restored from the session.

## Nesting

Observables is allowed to contain JSON serializable data and other observables.

Let's look at the following structure.

```js
import { observable } from "@dependable/state";

const nextId = 0;
const createTodo = ({ id = nextId++, text }) => ({
  id,
  text: observable(text),
});

const todos = observable(
  [
    createTodo("Buy milk"),
    createTodo("Walk the dog"),
    createTodo("Read important mail"),
  ],
  { id: "todos" }
);

saveSession();
```

If we save that, we will save the observable with the id `todos` together with all of the todos it contains.

Notice it is important to give id's to all of the hierarchies that is important to restore.

## License

MIT License

Copyright (c) 2022 Sune Simonsen sune@we-knowhow.dk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
