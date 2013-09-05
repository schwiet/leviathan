
#include "WebSocketServer.h"

#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include <string.h>
#include <signal.h>

#include <iostream>

#include "pfkchat-messages.pb.h"
#include "pfkchat-protoversion.h"

#include "chatConnection.h"

class myWebSocketConnectionCallback : public WebSocketConnectionCallback {
public:
    /*virtual*/ WebSocketConnection * newConnection(int fd)
    {
        return new myWebSocketConnection(fd);
    }
};

using namespace std;
using namespace PFK::Chat;

int
main()
{
    myWebSocketConnectionCallback callback;
    WebSocketServer      server;

    signal( SIGPIPE, SIG_IGN );

    initChatServer();
    if (server.start(1081, &callback) == false)
    {
        printf("failure to start server\n");
        return 1;
    }

    while (1)
        sleep(1);

    return 0;
}
