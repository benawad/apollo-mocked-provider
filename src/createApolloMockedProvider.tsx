import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  ITypeDefinitions,
} from 'graphql-tools';
import ApolloClient from 'apollo-client';
import { SchemaLink } from 'apollo-link-schema';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { ApolloCache } from 'apollo-cache';
import { InMemoryCache } from 'apollo-cache-inmemory';

export const createApolloMockedProvider = (
  typeDefs: ITypeDefinitions,
  globalCache?: ApolloCache<any>
) => ({
  customResolvers = {},
  cache,
  children,
}: {
  customResolvers?: any;
  children: React.ReactChild | JSX.Element;
  cache?: ApolloCache<any>;
}) => {
  // const mocks = mergeResolvers(globalMocks, props.customResolvers);

  const schema = makeExecutableSchema({
    typeDefs,
    resolverValidationOptions: { requireResolversForResolveType: false },
  });

  addMockFunctionsToSchema({ schema, mocks: customResolvers });

  const client = new ApolloClient({
    link: ApolloLink.from([onError(() => {}), new SchemaLink({ schema })]),
    cache: cache || globalCache || new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
