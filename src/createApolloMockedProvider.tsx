import * as React from 'react';
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
import { ApolloProvider } from 'react-apollo';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';

export const createApolloMockedProvider = (
  typeDefs: ITypeDefinitions,
  { cache: globalCache, provider, links }: ApolloMockedProviderOptions = {}
) => ({
  customResolvers = {},
  cache: componentCache,
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

  const cache = componentCache || globalCache || new InMemoryCache();

  const customLinks = links ? links({ cache, schema }) : [];

  const client = new ApolloClient({
    link: ApolloLink.from([
      onError(() => {}),
      ...customLinks,
      new SchemaLink({ schema }),
    ]),
    cache,
    defaultOptions: {
      mutate: { errorPolicy: 'all' },
    },
  });

  const Provider = provider ? provider : ApolloProvider;
  return <Provider client={client}>{children}</Provider>;
};
