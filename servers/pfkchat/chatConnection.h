/* -*- Mode:c++; eval:(c-set-style "BSD"); c-basic-offset:4; indent-tabs-mode:nil; tab-width:8 -*-  */

#ifndef __CHAT_CONNECTION_H__
#define __CHAT_CONNECTION_H__ 1

void initChatServer(void);

class myWebSocketConnection : public WebSocketConnection {
    class myWebSocketConnection * next;
    class myWebSocketConnection * prev;
    char username[128];
    bool authenticated;
    void sendClientMessage(const PFK::Chat::ServerToClient &msg,
                           bool broadcast);
public:
    myWebSocketConnection(int _fd);
    /*virtual*/ ~myWebSocketConnection(void);
    /*virtual*/ void onMessage(const WebSocketMessage &);
    /*virtual*/ void onReady(void);
};

#endif /* __CHAT_CONNECTION_H__ */
