import * as React from 'react';
import { ApolloLink, Observable } from 'apollo-link';
import ApolloClient from 'apollo-client';
import { ApolloCache } from 'apollo-cache';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';

export const createApolloLoadingProvider = ({
  cache: globalCache,
  provider,
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

  const Provider = provider ? provider : ApolloProvider;
  return <Provider client={client}>{children}</Provider>;
};
