import { ApolloError, DocumentNode, gql, useMutation } from '@apollo/client';

import { GET_TODOS } from '../queries';
import { CreateTodoMutationInput } from '../types';
import { GetTodosQueryInput } from '../types/input.type';

export const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      contents
      completedAt
      finishedAt
      startedAt
      createdAt
      updatedAt
    }
  }
`;

type UseCreateTodoMutation = {
  createTodo: (input: CreateTodoMutationInput) => void;
  loading: boolean;
  error?: ApolloError;
};

type Variables = {
  input: CreateTodoMutationInput;
};

export const useCreateTodoMutation = (
  getTodosQueryInput: GetTodosQueryInput,
): UseCreateTodoMutation => {
  const [createTodoMutation, { loading, error }] = useMutation<void, Variables>(
    CREATE_TODO,
    {
      refetchQueries: [
        {
          query: GET_TODOS,
          variables: {
            input: getTodosQueryInput,
          },
        },
      ],
    },
  );

  const createTodo = async (input: CreateTodoMutationInput) => {
    await createTodoMutation({
      variables: {
        input,
      },
    });
  };

  return { createTodo, loading, error };
};
