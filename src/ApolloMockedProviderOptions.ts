import { ApolloCache } from 'apollo-cache';
import { ApolloProviderProps } from 'react-apollo';

export interface ApolloMockedProviderOptions {
  cache?: ApolloCache<any>;
  provider?: React.ComponentType<ApolloProviderProps<any>>;
}
