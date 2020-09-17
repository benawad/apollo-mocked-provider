import React from 'react';
import { createApolloErrorProvider } from '../src';
import { render, waitForDomChange } from '@testing-library/react';
import { TodoApp } from './fixtures/Todo';
import { GraphQLError } from 'graphql';

test('works with defaults', async () => {
  const MockedProvider = createApolloErrorProvider();
  const { getByText } = render(
    <MockedProvider
      graphQLErrors={[
        new GraphQLError('Something terrible happened on the way to the moon.'),
      ]}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  expect(getByText('Error!', { exact: false })).toBeTruthy();
});
