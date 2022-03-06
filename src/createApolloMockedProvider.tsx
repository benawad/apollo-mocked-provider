import React, { ReactNode } from 'react';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';
import {
  ApolloCache,
  InMemoryCache,
  ApolloClient,
  ApolloLink,
  ApolloProvider,
} from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { onError } from '@apollo/client/link/error';
import { ITypeDefinitions } from '@graphql-tools/utils';
import { mergeResolvers } from '@graphql-tools/merge';

export const createApolloMockedProvider = (
  typeDefs: ITypeDefinitions,
  {
    cache: globalCache,
    links,
    defaultOptions,
    globalResolvers,
  }: ApolloMockedProviderOptions = {}
) => ({
  customResolvers = {},
  cache: componentCache,
  children,
}: {
  customResolvers?: any;
  children: ReactNode;
  cache?: ApolloCache<any>;
}) => {
  const mocks = mergeResolvers([globalResolvers, customResolvers]);

  const baseSchema = makeExecutableSchema({
    typeDefs,
    resolverValidationOptions: { requireResolversForResolveType: false },
  });

  const schema = addMocksToSchema({
    schema: baseSchema,
    mocks,
  });

  const cache = componentCache || globalCache || new InMemoryCache();

  const customLinks = links ? links({ cache, schema }) : [];

  const client = new ApolloClient({
    link: ApolloLink.from([
      onError(() => {}),
      ...customLinks,
      new SchemaLink({ schema }),
    ]),
    cache,
    defaultOptions,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
