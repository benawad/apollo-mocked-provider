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

export const ADD_TODO_MUTATION = gql`
  mutation addTodo($input: AddTodoInput) {
    addTodo(input: $input) {
      id
      createdTs
    }
  }
`;

interface Todo {
  id: string;
  text: string;
  createdTs: number;
}

interface Data {
  todos: Array<Todo>;
}

interface AddTodo {
  addTodo: Todo;
}

export const Todo = () => (
  <Query<Data> query={GET_TODOS_QUERY}>
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
