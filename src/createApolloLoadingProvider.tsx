import * as React from 'react';
import { ApolloLink, Observable } from 'apollo-link';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { ApolloCache } from 'apollo-cache';
import { InMemoryCache } from 'apollo-cache-inmemory';

export const createApolloLoadingProvider = (
  globalCache?: ApolloCache<any>
) => ({
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
