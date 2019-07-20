import React from 'react';
import { createApolloErrorProvider } from '../src';
import { render, waitForDomChange } from '@testing-library/react';
import { Todo } from './fixtures/Todo';

test('works with defaults', async () => {
  const MockedProvider = createApolloErrorProvider();
  const { getByText } = render(
    <MockedProvider graphQLErrors={[]}>
      <Todo />
    </MockedProvider>
  );

  await waitForDomChange();
  expect(getByText('Error!')).toBeTruthy();
});
