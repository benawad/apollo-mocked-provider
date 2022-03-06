import { ApolloCache, ApolloLink, DefaultOptions } from '@apollo/client';
import { GraphQLSchema } from 'graphql';

export interface LinksArgs {
  cache: ApolloCache<any>;
  schema: GraphQLSchema;
}

export interface ApolloMockedProviderOptions {
  cache?: ApolloCache<any>;
  links?: (args: LinksArgs) => Array<ApolloLink>;
  defaultOptions?: DefaultOptions;
  globalResolvers?: any;
}
