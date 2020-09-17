import React from 'react';
import { createApolloMockedProvider } from '../src';
import { readFileSync } from 'fs';
import {
  render,
  wait,
  waitForDomChange,
  fireEvent,
} from '@testing-library/react';
import { GET_TODOS_QUERY, TodoApp, TodoItem, TodoList } from './fixtures/Todo';
import path from 'path';
import { InMemoryCache, ApolloLink } from '@apollo/client';

const typeDefs = readFileSync(
  path.join(__dirname, 'fixtures/simpleSchema.graphql'),
  'utf8'
);

test('works with defaults', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { getByTestId } = render(
    <MockedProvider>
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  const todoList = getByTestId('todolist');
  expect(todoList).toBeTruthy();
  expect(todoList.children.length).toBeGreaterThanOrEqual(1);
});

test('works with custom resolvers', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { getByText } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [
            {
              text: 'First Todo',
            },
            {
              text: 'Second Todo',
            },
          ],
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();

  expect(getByText('First Todo')).toBeTruthy();
  expect(getByText('Second Todo')).toBeTruthy();
});

test('works with custom links', async () => {
  const linkAction = jest.fn();

  const MockedProvider = createApolloMockedProvider(typeDefs, {
    links: ({ cache, schema }) => [
      new ApolloLink((operation, forward) => {
        linkAction(cache, schema);
        return forward(operation);
      }),
    ],
  });

  render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [],
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  expect(linkAction).toHaveBeenCalledWith(
    expect.objectContaining({ addTypename: true }), // assert that the cache is passed
    expect.objectContaining({ astNode: undefined }) // assert that the schema is passed
  );
});

// This test does not pass.
// Looks like clientResolvers are deprecated in @apollo/client 3:
// see https://www.apollographql.com/docs/react/local-state/local-resolvers/
// test('works with client resolvers', async () => {
//   const clientResolvers = {
//     Todo: {
//       text: () => 'client',
//     },
//   };

//   const MockedProvider = createApolloMockedProvider(typeDefs, {
//     clientResolvers,
//   });

//   const { getAllByText } = render(
//     <MockedProvider>
//       <TodoList />
//     </MockedProvider>
//   );

//   await waitForDomChange();

//   expect(getAllByText('client')).toHaveLength(2);
// });

test('allows throwing errors within resolvers to mock Query API errors', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { container } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todo: () => {
            throw new Error('Boom');
          },
          todos: () => [
            {
              text: 'Success',
            },
          ],
        }),
      }}
    >
      <>
        <TodoList />
        <TodoItem id="fake" />
      </>
    </MockedProvider>
  );

  await waitForDomChange();
  expect(container.textContent).toMatch(/Success/);
  expect(container.textContent).toMatch(/Boom/);
});

test('allows throwing errors within resolvers to mock Mutation API errors', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { container, getByText } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [
            {
              text: 'First Todo',
            },
            {
              text: 'Second Todo',
            },
          ],
        }),
        Mutation: () => ({
          addTodo: () => {
            throw new Error('Boom');
          },
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  fireEvent.click(getByText('Add todo'));
  await waitForDomChange();
  expect(container.textContent).toMatch(/Boom/);
});

describe('caching', () => {
  test('allows users to provide a global cache', async () => {
    const cache = new InMemoryCache();
    const FirstMockedProvider = createApolloMockedProvider(typeDefs, { cache });
    cache.writeQuery({
      query: GET_TODOS_QUERY,
      data: {
        todos: [
          {
            id: '46e28ed9-1b92-4e1f-9fdf-f1e773dd5448',
            text: 'First Global Todo',
            createdTs: 10,
            __typename: 'Todo',
          },
          {
            id: '5451e580-291c-4a90-bb28-7602bfef64f1',
            text: 'Second Global Todo',
            createdTs: -11,
            __typename: 'Todo',
          },
        ],
      },
    });

    const { getByText } = render(
      <FirstMockedProvider customResolvers={{}}>
        <TodoApp />
      </FirstMockedProvider>,
      {
        container: document.createElement('div'),
      }
    );

    await wait();
    expect(getByText('First Global Todo')).toBeTruthy();
    expect(getByText('Second Global Todo')).toBeTruthy();

    const SecondMockedProvider = createApolloMockedProvider(typeDefs, {
      cache,
    });
    const { getByText: secondGetByText } = render(
      <SecondMockedProvider>
        <TodoApp />
      </SecondMockedProvider>,
      {
        container: document.createElement('div'),
      }
    );

    expect(secondGetByText('First Global Todo')).toBeTruthy();
    expect(secondGetByText('Second Global Todo')).toBeTruthy();
  });

  test('allows users to provide a local cache', () => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_TODOS_QUERY,
      data: {
        todos: [
          {
            id: '46e28ed9-1b92-4e1f-9fdf-f1e773dd5448',
            text: 'First Local Todo',
            createdTs: 10,
            __typename: 'Todo',
          },
          {
            id: '5451e580-291c-4a90-bb28-7602bfef64f1',
            text: 'Second Local Todo',
            createdTs: -11,
            __typename: 'Todo',
          },
        ],
      },
    });

    const FirstMockedProvider = createApolloMockedProvider(typeDefs);

    const { getByText } = render(
      <FirstMockedProvider cache={cache}>
        <TodoApp />
      </FirstMockedProvider>
    );

    expect(getByText('First Local Todo')).toBeTruthy();
    expect(getByText('Second Local Todo')).toBeTruthy();
  });

  test('it does not call custom resolvers for cached values. This a document of behavior, not necessarily desired. We may need to build around in the future.', () => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_TODOS_QUERY,
      data: {
        todos: [
          {
            id: '46e28ed9-1b92-4e1f-9fdf-f1e773dd5448',
            text: 'First Local Todo',
            createdTs: 10,
            __typename: 'Todo',
          },
          {
            id: '5451e580-291c-4a90-bb28-7602bfef64f1',
            text: 'Second Local Todo',
            createdTs: -11,
            __typename: 'Todo',
          },
        ],
      },
    });

    const FirstMockedProvider = createApolloMockedProvider(typeDefs);

    const { getByText } = render(
      <FirstMockedProvider
        customResolvers={{
          Query: () => {
            return {
              todos: () => [
                {
                  text: 'First Todo',
                },
                {
                  text: 'Second Todo',
                },
              ],
            };
          },
        }}
        cache={cache}
      >
        <TodoApp />
      </FirstMockedProvider>
    );

    expect(getByText('First Local Todo')).toBeTruthy();
  });
});
