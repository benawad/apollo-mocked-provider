import * as React from 'react';
import {
  ApolloLink,
  Observable,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloCache,
} from '@apollo/client';
import { GraphQLError } from 'graphql';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';

export const createApolloErrorProvider = ({
  cache: globalCache,
}: ApolloMockedProviderOptions = {}) => ({
  graphQLErrors,
  cache,
  children,
}: {
  graphQLErrors: GraphQLError[];
  cache?: ApolloCache<any>;
  children: React.ReactNode | JSX.Element;
}) => {
  // This is just a link that swallows all operations and returns the same thing
  // for every request: The specified error.
  const link = new ApolloLink(() => {
    return new Observable(observer => {
      observer.next({
        errors: graphQLErrors || [
          { message: 'Unspecified error from ErrorProvider.' },
        ],
      });
      observer.complete();
    });
  }) as any;

  const client = new ApolloClient({
    link,
    cache: cache || globalCache || new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
