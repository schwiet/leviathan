/* -*- Mode:c++; eval:(c-set-style "BSD"); c-basic-offset:4; indent-tabs-mode:nil; tab-width:8 -*-  */

#ifndef __CHAT_CONNECTION_H__
#define __CHAT_CONNECTION_H__ 1

#include <string>

void initChatServer(void);

class myWebSocketConnection : public WebSocketConnection {
    class myWebSocketConnection * next;
    class myWebSocketConnection * prev;
    std::string username;
    bool authenticated;
    void sendClientMessage(const PFK::Chat::ServerToClient &msg,
                           bool broadcast);
    void sendUserList(void);
public:
    const bool get_authenticated(void) const { return authenticated; }
    const std::string& get_username(void) const { return username; };
    myWebSocketConnection(int _fd);
    /*virtual*/ ~myWebSocketConnection(void);
    /*virtual*/ void onMessage(const WebSocketMessage &);
    /*virtual*/ void onReady(void);
};

#endif /* __CHAT_CONNECTION_H__ */
