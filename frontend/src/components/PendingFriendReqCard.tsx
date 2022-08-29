import { AxiosError } from 'axios';
import { Component, For, Show } from 'solid-js';
import { mutate } from 'turbo-solid';
import { acceptFriendReq, rejectFriendReq } from '../api/user';
import { routes } from '../api/utils';
import { useStore } from '../store/all';
import { notifyError, notifySuccess } from '../utils/helpers';

const PendingFriendReqCard: Component = () => {
  const [state, { setPendigFriendReq }] = useStore();

  const onAcceptFriendReq = (id: number) => {
    acceptFriendReq(id)
      .then((res) => {
        notifySuccess('success');
        console.log('res: ', res.data);
        mutate(routes.friends, [...res.data]);
        setPendigFriendReq(
          state.currentUser.pendingFriendReq.filter(
            (req) => req.req_user.id !== id,
          ),
        );
      })
      .catch((err) => notifyError(err.message));
  };

  const onRejectFriendReq = (id: number) => {
    rejectFriendReq(id)
      .then(() => {
        notifySuccess('success: friend request rejected');
        setPendigFriendReq(
          state.currentUser.pendingFriendReq.filter(
            (req) => req.req_user.id !== id,
          ),
        );
      })
      .catch((err: AxiosError<{ message: string }>) =>
        notifyError(err.response?.data.message as string),
      );
  };

  return (
    <Show
      when={state.currentUser.pendingFriendReq.length}
      fallback={
        <p class="bg-gray-700 p-3 border-1 text-white shadow-md border-red-600">
          No friend requests 🥲
        </p>
      }
    >
      <div class="border border-header-menu p-2 pt-4 shadow-md rounded-md bg-skin-menu-background">
        <For each={state.currentUser.pendingFriendReq}>
          {(user) => (
            <div class="grid grid-cols-2">
              <h1 class="text-white pr-2 text-lg">
                {user.req_user.display_name}
              </h1>
              <div>
                <button
                  onClick={() => onAcceptFriendReq(user.req_user.id)}
                  class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => onRejectFriendReq(user.req_user.id)}
                  class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};

export default PendingFriendReqCard;
