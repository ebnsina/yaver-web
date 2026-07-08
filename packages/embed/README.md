# @yaver/js

The Yaver embed SDK — add AI chat to any website or app with a **publishable
key** (`yvr_pk_…`, safe to ship in client-side code). Dependency-free ESM.

For a drop-in floating widget with no code, use the `<script src=".../widget.js">`
embed instead. Use this SDK when you want programmatic / headless control.

## Install

```sh
npm i @yaver/js
```

## Usage

```js
import { createYaver } from '@yaver/js';

const yaver = createYaver({
	publishableKey: 'yvr_pk_…',
	apiBase: 'https://api.yaver.app' // default
});

// One-off message
const { reply, conversation_id } = await yaver.send('Where is my order?');

// Stateful conversation (tracks conversation_id for you)
const chat = yaver.conversation();
console.log((await chat.send('Hi')).reply);
console.log((await chat.send('I need a refund')).reply); // same thread

// Widget appearance (title / welcome / accent)
const { title, welcome, accent } = await yaver.config();
```

Only the public, publishable-key endpoints are used — no secret key ever
touches the browser. The fully-typed API client for server-side use is generated
from the API's OpenAPI spec (`pnpm gen:api` in the dashboard repo).
