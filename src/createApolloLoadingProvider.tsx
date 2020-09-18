import * as React from 'react';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';
import {
  ApolloCache,
  ApolloLink,
  Observable,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';

export const createApolloLoadingProvider = ({
  cache: globalCache,
}: ApolloMockedProviderOptions = {}) => ({
  children,
  cache,
}: {
  children: React.ReactChild | JSX.Element;
  cache?: ApolloCache<any>;
}) => {
  const link = new ApolloLink(() => {
    return new Observable(() => {});
  });

  const client = new ApolloClient({
    link,
    cache: cache || globalCache || new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
