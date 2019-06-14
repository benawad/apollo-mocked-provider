import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  ITypeDefinitions,
} from 'graphql-tools';
import ApolloClient from 'apollo-client';
import { SchemaLink } from 'apollo-link-schema';
import { ApolloCache } from 'apollo-cache';

export const createApolloMockedProvider = (
  typeDefs: ITypeDefinitions,
  apolloCache: ApolloCache<any>
) => ({
  customResolvers = {},
  children,
}: {
  customResolvers?: any;
  children: React.ReactChild | JSX.Element;
}) => {
  // const mocks = mergeResolvers(globalMocks, props.customResolvers);

  const schema = makeExecutableSchema({
    typeDefs,
    resolverValidationOptions: { requireResolversForResolveType: false },
  });

  addMockFunctionsToSchema({ schema, mocks: customResolvers });

  const client = new ApolloClient({
    link: new SchemaLink({ schema }),
    cache: apolloCache,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
