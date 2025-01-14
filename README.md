
## How to make stuff happen

### your new best friend:
`./clear_docker_hell.sh`  
When to use it? Follow your heart.

### might be useful:
`./reset_db.sh`

There are now 3 (!) ways to bring up the whole thing, because we're masochists.

1) docker-compose up --build
2) ./launch.sh
3) ./serve_static.sh

Obs: **1** is the "production" way, and the only way it's gonna be avaible for the pushed version for correction

Either way, you need: 
- .env file at the **ROOT** of the repo.
- cert.pem and key.pem inside a secrets directory (which should be located at the repo's root)
App should be available at `httsp://localhost:3000` (mind the S in httpS !), except when using option 2: `http://localhost:8000`


```
APP_HOST=localhost
FRONTEND_URL=http://localhost:8000

# auth
FORTYTWO_CLIENT_ID=XXXXXXXXXX
FORTYTWO_CLIENT_SECRET=XXXXXXXXXXXXXX
FORTYTWO_CALLBACK_URL=https://localhost:3000/login/42/return
JWT_TOKEN_SECRET="hello there"
JWT_TOKEN_EXPIRY=99999999999999999999
TWOFA_ISSUER=Transcendence

# database
DB_PASSWORD=5om3th1ngApp@rently5tr0ng
DB_PORT=5432
DB_HOST=localhost

# avatar photo
AVATAR_DEFAULT_FILE=images/avatardefault.png
AVATAR_MAX_SIZE=5000000

```
## recent update: LOCALHOST wins! just use localhost, and not 127.0.0.1...

More details:

### dev-mode: 2 servers (front and backend)
`./launch.sh` (have the **.env** file ready)

Frontend app should be available at `http://127.0.01:8000`

### production mode: 1 server only, frontend app served as static files
* Have the **.env** file ready
* setup the first line of the script serve_static.sh accordingly (if you're using localhost or 127.0.0.1)
* `./serve_static.sh`   

App should be available at `https://127.0.01:3000` (httpS !)

### production mode fully Dockerized:
* `docker-compose up [--build]`


App should be available at `https://127.0.01:3000` (httpS !)

### How to access the database with the psql client :
`docker exec -it db psql -U postgres`

Useful commands:
* \d (show tables)
* \d [table name] (describe table)


----------------------
### Mock-authentication
You can log in as a mock user bypassing the OAuth-intra-42 drill via 
```
POST 127.0.0.1:3000/mock-auth/login
request body:
{
    "login42": "filip_the_king"
}
```
This will create a new user if necessary.

To log out:
```
GET 127.0.0.1:3000/mock-auth/logout
```

(Why? So you can make tests with different users without having to ask your buddy's 42 intra password, and use Postman for your tests)  

## API documentation (by Swagger)  
    127.0.0.1:3000/api  

## Play Pong!

You have to be logged in first.  
`127.0.0.1:3000/player` will get you a player.   
Login as someone else in ANOTHER BROWSER (or use a incognito tab x normal tab... just mind the cookies!) and open the same page so you can play... against yourself. 
Your game session id will be displayed at the top-left corner of the screen once the game is started.

Wanna watch you VS you? `127.0.0.1:3000/viewer.html`. Check the top of the screen to see the list of the ongoing game sessions.

## Pong: for the front-end dev
1. be logged in
2. connect to the WebSocket server dedicated for pong:  
` const ws = new WebSocket(ws://127.0.0.1:3000/pong);`
3. send a message telling what you want to do

* play against anyone
```
    ws.send(JSON.stringify({
      event: 'play'
    }));
```

* invite a specific user to play against you:

```
    ws.send(JSON.stringify({
      event: 'invite',
      data: <user_id> (from the invited person)
    }));
```
* accept someone's invitation to play
```
    ws.send(JSON.stringify({
      event: 'accept',
      data: <user_id> (from the user that invited you)
    }));
```

* cancel 'invite' and 'play' actions
```
    ws.send(JSON.stringify({
      event: 'cancel'
    }));
```


Check out client/player.html "script" part at the bottom

## Chat
What you can do for now:
### Users
* You can login: POST /mock-auth/**login**  
* Then you can login again with a different user so you'll have a buddy to talk to
* You can check the existent users in GET /users
* Or see your own info at GET /users/me

### DM
* you can send your buddy a direct message via POST /chat/dm
* you can check DMs via  
    * GET /chat/dm/{your buddy's id} or
    * GET /chat/room_messages/{room_id} (see below under "Rooms")

### Group
* create a group: POST /chat/create_group
* add your buddy to a group: POST /chat/add_group_user

### Rooms (DM or Group: they are all rooms!)
* verify the rooms you're part of: GET /chat/rooms (this is how you find out the rooms' ids)
* send a message to a room: POST /chat/message_to_room
* see the messages in a room: /chat/room_messages/{room_id}
* get more info about a room: /chat/room_info/{room_id}

## Friends
See the routes in 127.0.0.1:3000/api.  
You can send a friendship request, accept or refuse one, check your friends status, etc.


## Stats
See the routes in 127.0.0.1:3000/api. 

There's a points system and a ladder.

Winning a Pong match gives you:  
* 300 points if you won against someone better ranked than you
* 100 points otherwise  

Losing a match costs you 100 points (but you won't go below 0).

You can check matches history in general or for an individual player, and other stats (wins, loss, ratio, etc)


Fell free to implement a different ladder/points system.

## Get real-time notifications via Websocket
Client-side:   
obs: this is a different websocket server than the one for pong. And this is how a user becomes online/offline.
```
// Create WebSocket connection (login first, so the JWT is included as cookie)
const socket = new WebSocket('ws://127.0.0.1:3000/');

// in case you wanna do something when connection is established
socket.addEventListener('open', function (event) {
    console.log('connected to WS server');
});

// in case you wanna do something when connection is closed
socket.addEventListener('close', function (event) {
    console.log('disconneted from WS server');
});

// now the real deal: event listener for received messages
socket.addEventListener('message', function(event) {
    const payload = event.data;
    console.log('message from ws server: ', payload);

    if (payload.event === 'chat_dm') {
        const new_msg = payload.message;
        // Do something
    }
    
    if (payload.event === 'chat_room_msg') {
        const new_msg = payload.message;
        // Do something
    }

    if (payload.event === 'chat_new_group') {
        const room_id = payload.room_id;
        // You were added to this room (group), do something
    }

    if (payload.event === 'chat_new_user_in_group') {
        const room_id = payload.room_id;
        const new_user = payload.user_id;
        // a new user was added to this room
    }

    // etc...
});
```

## Notifications via Websocket schemas/examples

### Upon connection
connection/authentication success
```
{
    "event": "ws_auth_success"
}
```

connection/authentication fail: invalid/absent JWT
```
{
    "event": "ws_auth_fail",
    "reason": "no valid JWT"
}
```

connection/authentication fail: duplicate connection attempt
```
{
    "event": "ws_auth_fail",
    "reason": "already connected"
}
```

### Chat
Direct Message
```
{
    "event": "chat_dm",
    "message": {
        "id": 2,
        "message": "yo",
        "timestamp": "2022-06-17T00:21:37.402Z",
        "room_id": 2,
        "user_id": 5,
        "login42": "user_7",
        "display_name": "user_7"
    }
}
```
new group for you (you are now part of this room = you were added, or you created it...)
```
{
    "event": "chat_new_group",
    "room_id": 3
}
```
a user was added to a group that you're part of
```
{
    "event": "chat_new_user_in_group",
    "room_id": 3,
    "user_id": 3
}
```
new group message
```
{
    "event": "chat_room_msg",
    "message": {
        "id": 3,
        "message": "whatup people in tha group??",
        "timestamp": "2022-06-17T00:29:31.649Z",
        "room_id": 3,
        "user_id": 5,
        "login42": "user_7",
        "display_name": "user_7"
    }
}
```

you got kicked
```
{
    "event": "chat: youGotKicked",
    "data": {
        "room_name": "groupy"
    }
}
```
### Friends
Incoming Friendship request
```
 "event": "friends: new_request",
    "friend_request": {
        "requesting_user": {
            "id": 5,
            "login42": "user_7",
            "display_name": "user_7",
            "avatarId": null,
            "isTwoFactorAuthenticationEnabled": false,
            "status": null
        },
        "req_user_id": 5,
        "receiving_user": {
            "id": 3,
            "login42": "user_1",
            "display_name": "user_1",
            "avatarId": null,
            "isTwoFactorAuthenticationEnabled": false,
            "status": null
        },
        "recv_user_id": 3
    }
}
```

Friendship request was accepted
```
{
    "event": "friends: request_accepted",
    "friend_request": {
        "req_user_id": 5,
        "recv_user_id": 3,
        "status": 1
    }
}
```

Friendship request was rejected
```
{
    "event": "friends: request_rejected",
    "friend_request": {
        "req_user_id": 5,
        "recv_user_id": 3,
        "status": 2
    }
}
```

### Status (online/offline/playing)
one of your friends became online (or finished a match: playing -> online)
```
{
    "event": "status: friend_online",
    "user_id": 3
}
```
one of your friends became offline

```
{
    "event": "status: friend_offline",
    "user_id": 3
}
```
one of your friends started a match
```
{
    "event": "status: friend_playing",
    "user_id": 3
}
```


### Pong

someone invited you to play pong
```
{
    "event": "pong: invitation",
    "user_id": 3
}
```

someone accepted your invitation to play
```
{
    "event": "pong: invitation_accepted",
    "user_id": 3
}
```
someone has just joined a waiting player to play pong (both users get notified)
```
{
    "event": "pong: player_joined",
    "waiting_player": 3,
    "joining_player": 4
}
```

a game session has just begun
```
{
    "event":"pong: new_session",
    "session_id":1
}
```

a game session has just ended
```
{
    "event":"pong: session_over",
    "session_id":1
}
```

~~opponent is disconnected from the pong wss (e.g. closed browser tab)~~  
~~`{event: 'pong: opponent_disconnected'}`~~ (removed)

### Ladder change
When a Pong match is over, points in the general ladder are changed
```
{
    "event":"ladder_change",
    "ladder":[
        {"rank":1,"user_id":5,"display_name":"user_5","points":400},
        {"rank":2,"user_id":1,"display_name":"user_1","points":300},
        {"rank":3,"user_id":6,"display_name":"user_6","points":100},
        {"rank":4,"user_id":3,"display_name":"user_3","points":0},
        {"rank":4,"user_id":4,"display_name":"user_4","points":0},
        {"rank":4,"user_id":2,"display_name":"user_2","points":0},
        {"rank":4,"user_id":7,"display_name":"hey","points":0},
        {"rank":4,"user_id":8,"display_name":"ff","points":0}
    ]
}
```
### Users
A new user was created
```
{
    "event":"users: new_user",
    "user_id":4
}
```

## Chat specification
(things that are not cristal clear in the subject and a decision had to be made)
### Block: 

~~applies only to DMs~~

applies both ways (one blocking the other results in the DM beign blocked)

~~users in a blocked DM cannot POST new messages. But the old ones are still there to be seen.
(this has been changed from David's original design. And it's open to discussion, of course)~~

### Banned and muted:

applies only to Groups

Banned: temporarily removed from a group, rejoins automatically after ban time. 

Muted: temporarily cannot POST messages to a group

### Join a group:
can only be done to public groups (password protected or not).  Might need to provide a valid password.  

To join a private group, you need to be added to it by one of the group's admin.

### Add user to group :
needs to be done by an admin (public or private group). Password not required in this case. (so protecting a private group with password makes little sense)
