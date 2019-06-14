import * as React from 'react';
import { ApolloLink, Observable } from 'apollo-link';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { ApolloCache } from 'apollo-cache';

export const createApolloLoadingProvider = (apolloCache: ApolloCache<any>) => ({
  children,
}: {
  children: React.ReactChild | JSX.Element;
}) => {
  const link = new ApolloLink(() => {
    return new Observable(() => {});
  });

  const client = new ApolloClient({
    link,
    cache: apolloCache,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
