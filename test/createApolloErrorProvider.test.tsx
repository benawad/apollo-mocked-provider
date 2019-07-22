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

test('allows user to provide a custom provider', () => {
  const MyCustomProvider = jest.fn(() => <div />);

  const CustomizedProvider = createApolloErrorProvider({
    provider: MyCustomProvider,
  });
  render(<CustomizedProvider graphQLErrors={[]}> </CustomizedProvider>);
  expect(MyCustomProvider).toHaveBeenCalled();
});
