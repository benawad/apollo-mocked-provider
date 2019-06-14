import * as React from 'react';
import { ApolloLink, Observable } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { GraphQLError } from 'graphql';
import { ApolloCache } from 'apollo-cache';

export const createApolloErrorProvider = (apolloCache: ApolloCache<any>) => ({
  graphQLErrors,
  children,
}: {
  graphQLErrors: GraphQLError[];
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
    cache: apolloCache,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
