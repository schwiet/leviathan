/* -*- Mode:c++; eval:(c-set-style "BSD"); c-basic-offset:4; indent-tabs-mode:nil; tab-width:8 -*-  */

#ifndef __CHAT_CONNECTION_H__
#define __CHAT_CONNECTION_H__ 1

#include <string>
#include "pfkchat-messages.pb.h"

void initChatServer(void);

class myWebSocketConnection : public WebSocketConnection {
    class myWebSocketConnection * next;
    class myWebSocketConnection * prev;
    std::string username;
    bool authenticated;
    int idleTime;
    PFK::Chat::TypingState typing;
    void sendClientMessage(const PFK::Chat::ServerToClient &msg,
                           bool broadcast);
    void sendUserList(bool broadcast);
public:
    const bool get_authenticated(void) const { return authenticated; }
    const PFK::Chat::TypingState get_typing(void) { return typing; }
    const std::string& get_username(void) const { return username; };
    const int get_idleTime(void) { return idleTime; }
    myWebSocketConnection(int _fd);
    /*virtual*/ ~myWebSocketConnection(void);
    /*virtual*/ void onMessage(const WebSocketMessage &);
    /*virtual*/ void onReady(void);
};

#endif /* __CHAT_CONNECTION_H__ */
