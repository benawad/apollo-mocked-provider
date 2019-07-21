import React from 'react';
import { createApolloMockedProvider } from '../src';
import { readFileSync } from 'fs';
import { render, waitForDomChange, wait } from '@testing-library/react';
import { GET_TODOS_QUERY, Todo } from './fixtures/Todo';
import path from 'path';
import { InMemoryCache } from 'apollo-boost';

const typeDefs = readFileSync(
  path.join(__dirname, 'fixtures/simpleSchema.graphql'),
  'utf8'
);

test('works with defaults', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { getByTestId } = render(
    <MockedProvider>
      <Todo />
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
      <Todo />
    </MockedProvider>
  );

  await waitForDomChange();

  expect(getByText('First Todo')).toBeTruthy();
  expect(getByText('Second Todo')).toBeTruthy();
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
        <Todo />
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
        <Todo />
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
        <Todo />
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
        <Todo />
      </FirstMockedProvider>
    );

    expect(getByText('First Local Todo')).toBeTruthy();
    expect(getByText('Second Local Todo')).toBeTruthy();
  });

  test('allows user to provide a custom provider', () => {
    const MyCustomProvider = jest.fn(() => <div />);

    const CustomizedProvider = createApolloMockedProvider(typeDefs, {
      provider: MyCustomProvider,
    });
    render(<CustomizedProvider> </CustomizedProvider>);
    expect(MyCustomProvider).toHaveBeenCalled();
  });
});
