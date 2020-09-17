import { ApolloCache, ApolloLink, Resolvers } from '@apollo/client';
import { GraphQLSchema } from 'graphql';

export interface LinksArgs {
  cache: ApolloCache<any>;
  schema: GraphQLSchema;
}

export interface ApolloMockedProviderOptions {
  cache?: ApolloCache<any>;
  links?: (args: LinksArgs) => Array<ApolloLink>;
  clientResolvers?: Resolvers | Resolvers[] | undefined;
}
