import React from 'react';
import { createApolloMockedProvider } from '../src';
import { readFileSync } from 'fs';
import { render, waitFor, fireEvent } from '@testing-library/react';
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

  await waitFor(() => {});
  const todoList = getByTestId('todolist');
  expect(todoList).toBeTruthy();
  expect(todoList.children.length).toBeGreaterThanOrEqual(1);
});

test('works with global resolvers', async () => {
  const globalResolvers = {
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
  };

  const MockedProvider = createApolloMockedProvider(typeDefs, {
    globalResolvers,
  });
  const { getByText } = render(
    <MockedProvider>
      <TodoApp />
    </MockedProvider>
  );

  await waitFor(() => {});
  expect(getByText('First Todo')).toBeTruthy();
  expect(getByText('Second Todo')).toBeTruthy();
});

test('custom resolvers override global resolvers that conflict', async () => {
  const globalResolvers = {
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
  };

  const MockedProvider = createApolloMockedProvider(typeDefs, {
    globalResolvers,
  });
  const { getByText, queryByText } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [
            {
              text: 'Custom First Todo',
            },
            {
              text: 'Custom Second Todo',
            },
          ],
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitFor(() => {});
  expect(getByText('Custom First Todo')).toBeTruthy();
  expect(getByText('Custom Second Todo')).toBeTruthy();
  expect(queryByText('First Todo')).not.toBeTruthy();
  expect(queryByText('Second Todo')).not.toBeTruthy();
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

  await waitFor(() => {});
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

  await waitFor(() => {});
  expect(linkAction).toHaveBeenCalledWith(
    expect.objectContaining({ addTypename: true }), // assert that the cache is passed
    expect.objectContaining({ astNode: undefined }) // assert that the schema is passed
  );
});

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

  await waitFor(() => {});
  expect(container.textContent).toMatch(/Success/);
  expect(container.textContent).toMatch(/Boom/);
});

test('allows throwing errors within resolvers to mock Mutation API errors', async () => {
  const mockOnCatch = jest.fn();
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
        Mutation: () => ({
          addTodo: () => {
            throw new Error('Boom');
          },
        }),
      }}
    >
      <TodoApp onCatch={mockOnCatch} />
    </MockedProvider>
  );

  await waitFor(() => getByText('Add todo'));
  fireEvent.click(getByText('Add todo'));
  await waitFor(() => expect(mockOnCatch).toHaveBeenCalled());
});

test('uses defaultOptions when creating Apollo Client instance', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs, {
    defaultOptions: { mutate: { errorPolicy: 'all' } },
  });
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

  await waitFor(() => getByText('Add todo'));
  fireEvent.click(getByText('Add todo'));
  await waitFor(() => expect(container.textContent).toMatch(/Boom/));
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

    await waitFor(() => {});
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
