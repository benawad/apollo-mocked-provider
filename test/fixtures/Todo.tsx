import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

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

export const TodoApp = () => {
  const { loading, error, data } = useQuery<GetTodos>(GET_TODOS_QUERY);

  const [addTodo, { error: mutationError, data: mutationData }] = useMutation<
    AddTodo
  >(ADD_TODO_MUTATION);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error! ({error.message})</p>;
  return (
    <>
      {data && (
        <ul data-testid="todolist">
          {data.todos.map((todo, idx) => (
            <li key={idx}>{todo.text}</li>
          ))}
        </ul>
      )}
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
    </>
  );
};

export const TodoList = () => {
  const { data } = useQuery<GetTodos>(GET_TODOS_QUERY);

  return <div>{data && data.todos && data.todos.map(d => d.text)}</div>;
};

export const TodoItem = ({ id }: { id: string }) => {
  const { error } = useQuery<GetTodo>(GET_TODO_QUERY, {
    variables: { id },
  });

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  } else {
    return <div>OKAY</div>;
  }
};
