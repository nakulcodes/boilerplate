'use client';

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  Observable,
} from '@apollo/client';
import type { FetchResult, Operation } from '@apollo/client';
import type { GraphQLFormattedError } from 'graphql';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearTokens,
} from '@/utils/cookies';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const GRAPHQL_URL = `${API_BASE}/graphql`;

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function resolvePendingRequests() {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
});

const authLink = new ApolloLink((operation, forward) => {
  const token = getToken();
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

function isUnauthenticatedError(
  errors: readonly GraphQLFormattedError[] | undefined,
): boolean {
  if (!errors) return false;
  return errors.some((err) => err.extensions?.code === 'UNAUTHENTICATED');
}

function handleAuthError(
  operation: Operation,
  forward: (op: Operation) => Observable<FetchResult>,
  err: GraphQLFormattedError,
): Observable<FetchResult> | void {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return;
  }

  if (isRefreshing) {
    return new Observable((observer) => {
      pendingRequests.push(() => {
        const subscriber = {
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        };
        forward(operation).subscribe(subscriber);
      });
    });
  }

  isRefreshing = true;

  return new Observable((observer) => {
    refreshAccessToken()
      .then((newToken) => {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${newToken}`,
          },
        }));

        resolvePendingRequests();
        isRefreshing = false;

        const subscriber = {
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        };
        forward(operation).subscribe(subscriber);
      })
      .catch(() => {
        pendingRequests = [];
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        observer.error(err);
      });
  });
}

const errorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => {
        if (isUnauthenticatedError(result.errors)) {
          const err = result.errors?.find(
            (e) => e.extensions?.code === 'UNAUTHENTICATED',
          );
          if (err) {
            const retryObservable = handleAuthError(operation, forward, err);
            if (retryObservable) {
              retryObservable.subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
              return;
            }
          }
        }
        observer.next(result);
      },
      error: (networkError) => {
        console.error(`[Network error]: ${networkError}`);
        observer.error(networkError);
      },
      complete: observer.complete.bind(observer),
    });
    return () => subscription.unsubscribe();
  });
});

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({
      query: `
        mutation RefreshToken {
          refreshToken {
            accessToken
            refreshToken
          }
        }
      `,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error('Token refresh failed');
  }

  const { accessToken, refreshToken: newRefreshToken } =
    result.data.refreshToken;
  setToken(accessToken);
  setRefreshToken(newRefreshToken);

  return accessToken;
}

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          keyArgs: [
            'input',
            [
              'status',
              'search',
              'actorId',
              'action',
              'method',
              'startDate',
              'endDate',
            ],
          ],
          merge(existing, incoming) {
            return incoming;
          },
        },
        auditLogs: {
          keyArgs: [
            'input',
            ['actorId', 'action', 'method', 'startDate', 'endDate'],
          ],
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export function createApolloClient() {
  return apolloClient;
}
