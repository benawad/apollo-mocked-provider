import React from 'react';
import { Mutation, Query } from 'react-apollo';
import { gql } from 'apollo-boost';

export const GET_TODOS_QUERY = gql`
  query getTodos {
    todos {
      id
      text
      createdTs
    }
  }
`;

export const GET_TODOS_WITH_CLIENT_RESOLVER_QUERY = gql`
  query getTodosWithClientResolver {
    todos {
      id
      text @client
      createdTs
    }
  }
`;

export const GET_TODO_QUERY = gql`
  query getTodo($id: ID!) {
    todo(id: $id) {
      id
      text
      createdTs
    }
  }
`;

export const ADD_TODO_MUTATION = gql`
  mutation addTodo($input: AddTodoInput) {
    addTodo(input: $input) {
      id
      createdTs
    }
  }
`;

export interface Todo {
  id: string;
  text: string;
  createdTs: number;
}

export interface GetTodos {
  todos: Array<Todo>;
}

export interface AddTodo {
  addTodo: Todo;
}

export interface GetTodo {
  todo: Todo;
}

export const Todo = () => (
  <Query<GetTodos> query={GET_TODOS_QUERY}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error!</p>;
      return (
        <>
          <ul data-testid="todolist">
            {data!.todos.map((todo, idx) => (
              <li key={idx}>{todo.text}</li>
            ))}
          </ul>
          <Mutation<AddTodo> mutation={ADD_TODO_MUTATION}>
            {(addTodo, { error: mutationError, data: mutationData }) => {
              return (
                <div>
                  {!mutationError && mutationData && mutationData.addTodo && (
                    <>Successfully added {mutationData.addTodo.text}</>
                  )}
                  <button
                    onClick={() => {
                      addTodo({ variables: { input: { text: 'hardcoded' } } });
                    }}
                  >
                    Add todo
                  </button>
                  {mutationError && <div>{mutationError.message}</div>}
                </div>
              );
            }}
          </Mutation>
        </>
      );
    }}
  </Query>
);
