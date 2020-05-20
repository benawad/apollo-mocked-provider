import { ApolloCache } from 'apollo-cache';
import { ApolloProviderProps } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import { GraphQLSchema } from 'graphql';

export interface LinksArgs {
  cache: ApolloCache<any>;
  schema: GraphQLSchema;
}

export interface ApolloMockedProviderOptions {
  cache?: ApolloCache<any>;
  provider?: React.ComponentType<ApolloProviderProps<any>>;
  links?: (args: LinksArgs) => Array<ApolloLink>;
}
