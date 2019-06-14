# apollo-mocked-provider

Automatically mock GraphQL data with a mocked ApolloProvider

Inspiration: https://www.freecodecamp.org/news/a-new-approach-to-mocking-graphql-data-1ef49de3d491/

## install

```
yarn add apollo-mocked-provider
```

## setup

```jsx
import {
  createApolloErrorProvider,
  createApolloMockedProvider,
  createApolloLoadingProvider
} from "apollo-mocked-provider";
import { typeDefs } from "./typeDefs";
import { InMemoryCache } from "apollo-boost";

const cache = new InMemoryCache();

export const ApolloMockedProvider = createApolloMockedProvider(typeDefs, cache);
export const ApolloErrorProvider = createApolloErrorProvider(cache);
export const ApolloLoadingProvider = createApolloLoadingProvider(cache);
```

You can get the `typeDefs` with this helper file

```
// downloadTypeDefs.js
const { fetchTypeDefs } = require("apollo-mocked-provider");

(() => {
  fetchTypeDefs({ uri: "http://localhost:4000/graphql" });
})();
```

Then run that file

```
node downloadTypeDefs.js
```

## testing

```
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Todos } from "./Todos";
import {
  ApolloLoadingProvider,
  ApolloErrorProvider,
  ApolloMockedProvider
} from "./test-utils/providers";

afterEach(cleanup);

test("TodoForm", async () => {
  const { debug } = render(
    <ApolloMockedProvider>
      <Todos />
    </ApolloMockedProvider>
  );

  debug();
  await Promise.resolve();
  debug();
});
```

Loading:

``jsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Todos } from "./Todos";
import {
  ApolloLoadingProvider,
  ApolloErrorProvider,
  ApolloMockedProvider
} from "./test-utils/providers";

afterEach(cleanup);

test("TodoForm", async () => {
  const { debug } = render(
    <ApolloLoadingProvider>
      <Todos />
    </ApolloLoadingProvider>
  );

  debug();
});

```

Error:

```jsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Todos } from "./Todos";
import {
  ApolloLoadingProvider,
  ApolloErrorProvider,
  ApolloMockedProvider
} from "./test-utils/providers";

afterEach(cleanup);

test("TodoForm", async () => {
  const { debug } = render(
    <ApolloErrorProvider graphQLErrors={[{ message: "something went wrong" }]}>
      <Todos />
    </ApolloErrorProvider>
  );

  debug();
  await Promise.resolve()
  debug();
});

```

Custom mocks:

```jsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Todos } from "./Todos";
import {
  ApolloLoadingProvider,
  ApolloErrorProvider,
  ApolloMockedProvider
} from "./test-utils/providers";

afterEach(cleanup);

test("TodoForm", async () => {
  const { debug } = render(
    <ApolloMockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [{ id: 1, type: "hello from custom mocked data" }]
        })
      }}
    >
      <Todos />
    </ApolloMockedProvider>
  );

  debug();
  await Promise.resolve();
  debug();
});
```
