import { Component, createEffect, onCleanup, onMount, Show } from 'solid-js';
import { Route, Routes, useNavigate } from 'solid-app-router';
import Chat from './pages/Chat';
import Pong from './pages/Pong';
import Viewer from './pages/Viewer';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useStore } from './store/index';
import EditProfile from './pages/EditProfile';
import TwoFactorAuth from './pages/TwoFactorAuth';
import { Message, WsNotificationEvent } from './types/chat.interface';
import LeaderBoard from './pages/LeaderBoard';
import { Toaster } from 'solid-toast';

const App: Component = () => {
  const [state, { setFriendInvitation }] = useStore();
  const navigate = useNavigate();
  onMount(() => {
    state.ws.addEventListener('message', (e) => {
      let res: {
        event: WsNotificationEvent;
        message?: Message;
        user_id?: number;
        friend_request?: {
          req_user_id?: number;
          recv_user_id?: number;
          receiving_user?: { id: number };
          requesting_user?: { id: number };
          status: number;
        };
      };
      res = JSON.parse(e.data);
      switch (res.event) {
        // case 'friends: new_request':
        //   const reqUser = users()?.find(
        //     (user) => user.id === res.friend_request!.requesting_user!.id,
        //   );
        //   if (reqUser) {
        //     addPendingFriendReq({ status: 0, req_user: reqUser });
        //   }
        //   break;
        case 'friends: request_accepted':
          console.log(`${res.event}: `, res);
          break;
        case 'friends: request_rejected':
          console.log(`${res.event}: `, res);
          break;
        case 'status: friend_offline':
          console.log(`${res.event}: `, res);
          break;
        case 'status: friend_online':
          console.log(`${res.event}: `, res);
          break;
        case 'status: friend_online':
          console.log(`${res.event}: `, res);
          break;
        case 'pong: player_joined':
          navigate('/pong');
          break;
        case 'pong: invitation_accepted':
          navigate('/pong');
          break;
        case 'pong: invitation':
          setFriendInvitation(res);
          break;
        case 'ws_auth_fail':
          navigate('/login');
          break;
        case 'users: new_user':
          refetch();
          break;
        default:
          console.log(`${res.event}: `, res);
          break;
      }
    });
    state.ws.addEventListener('open', (e) => {});
    state.ws.addEventListener('close', (e) => {});
  });

  createEffect(() => {
    // if (loadMessages && state.chat.roomId) {
    //   loadMessages(state.chat.roomId);
    // }
    // if (pendingFriendReq()) {
    //   setPendigFriendReq([]);
    //   pendingFriendReq()!.forEach((req) => {
    //     addPendingFriendReq(req);
    //   });
    // }
  });

  onCleanup(() => {
    state.ws.close();
    state.pong.ws.close();
  });

  return (
    <>
      <Show when={state.token}>
        <Header />
      </Show>
      <div class="container h-90 bg-skin-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/pong" element={<Pong />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit_profile" element={<EditProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;
