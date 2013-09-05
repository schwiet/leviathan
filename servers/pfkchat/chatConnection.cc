
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
#include "passwordDatabase.h"

using namespace std;
using namespace PFK::Chat;

PasswordDatabase * pwd_db;
myWebSocketConnection * clientList;
pthread_mutex_t  clientMutex;
#define   lock() pthread_mutex_lock  ( &clientMutex )
#define unlock() pthread_mutex_unlock( &clientMutex )



void
initChatServer(void)
{
    clientList = NULL;
    pthread_mutexattr_t  mattr;
    pthread_mutexattr_init( &mattr );
    pthread_mutex_init( &clientMutex, &mattr );
    pthread_mutexattr_destroy( &mattr );
    pwd_db = new PasswordDatabase;
}

myWebSocketConnection :: myWebSocketConnection(int _fd)
    : WebSocketConnection(_fd)
{
    lock();
    if (clientList)
        clientList->prev = this;
    next = clientList;
    prev = NULL;
    clientList = this;
    unlock();
    authenticated = false;
    strcpy(username, "guest");
}

myWebSocketConnection :: ~myWebSocketConnection(void)
{
    // xxx send client logout message

    lock();
    if (prev)
        prev->next = next;
    else
        clientList = next;
    if (next)
        next->prev = prev;
    unlock();
}

void
myWebSocketConnection :: sendClientMessage(const ServerToClient &outmsg,
                                           bool broadcast)
{
    string outmsgbinary;

    if (outmsg.type() != STC_PONG)
        cout << "sending message to browser: " << outmsg.DebugString() << endl;

    outmsg.SerializeToString( &outmsgbinary );

    WebSocketMessage outm;
    outm.type = WS_TYPE_BINARY;
    outm.buf = (uint8_t*)  outmsgbinary.data();
    outm.len = (int)       outmsgbinary.length();

    if (broadcast)
    {
        lock();
        for (myWebSocketConnection * c = clientList; c; c = c->next)
        {
            c->sendMessage(outm);
        }
        unlock();
    }
    else
    {
        sendMessage(outm);
    }
}

void
myWebSocketConnection :: onReady(void)
{
    // xxx
}

static bool
legalString( string str )
{
    int len = str.length();
    if (len > 20)
        return false;
    int good = 0;
    for (int pos = 0; pos < len; pos++)
    {
        int c = str[pos];
        if (c >= '0' && c <= '9')
            good++;
        if (c >= 'a' && c <= 'z')
            good++;
        if (c >= 'A' && c <= 'Z')
            good++;
    }
    return good == len;
}

void
myWebSocketConnection :: onMessage(const WebSocketMessage &m)
{
    ClientToServer   msg;

    if (msg.ParseFromString(string((char*)m.buf, (int)m.len)) == false)
    {
        cout << "ParseFromString failed!" << endl;
        return;
    }

    if (msg.type() != CTS_PING)
        cout << "decoded message from server: " << msg.DebugString() << endl;

    if (msg.type() != CTS_PROTOVERSION &&
        msg.type() != CTS_PING &&
        msg.type() != CTS_LOGIN &&
        msg.type() != CTS_REGISTER &&
        authenticated == false)
    {
        set_done();
    }

    switch (msg.type())
    {
    case CTS_PROTOVERSION:
    {
        ServerToClient  srv2cli;
        srv2cli.set_type( STC_PROTOVERSION_RESP );
        if (msg.has_protoversion() && msg.protoversion().version() ==
            PFK_CHAT_CurrentProtoVersion)
        {
            srv2cli.set_protoversionresp(PROTO_VERSION_MATCH);
        }
        else
        {
            srv2cli.set_protoversionresp(PROTO_VERSION_MISMATCH);
        }
        sendClientMessage( srv2cli, false );
        break;
    }
    case CTS_PING:
    {
        ServerToClient  srv2cli;
        srv2cli.set_type( STC_PONG );
        sendClientMessage( srv2cli, false );
        break;
    }
    case CTS_LOGIN:
    {
        PasswordEntry * pw = pwd_db->lookupUser(msg.login().username());
        ServerToClient  srv2cli;
        srv2cli.set_type( STC_LOGIN_STATUS );

        if (pw == NULL)
        {
            srv2cli.mutable_loginstatus()->set_status( LOGIN_REJECT );
        }
        else
        {
            if (pw->password != msg.login().password())
                srv2cli.mutable_loginstatus()->set_status( LOGIN_REJECT );
            else
            {
                pwd_db->newToken(pw);
                srv2cli.mutable_loginstatus()->set_status( LOGIN_ACCEPT );
                srv2cli.mutable_loginstatus()->set_token( pw->token );
            }
        }
        sendClientMessage( srv2cli, false );
        break;
    }
    case CTS_REGISTER:
    {
        string uname = msg.regreq().username();
        string pwd   = msg.regreq().password();
        ServerToClient  srv2cli;
        srv2cli.set_type( STC_REGISTER_STATUS );

        if (!legalString(uname))
        {
            srv2cli.mutable_registerstatus()->set_status(
                REGISTER_INVALID_USERNAME );
        }
        else
        {
            if (!legalString(pwd))
            {
                srv2cli.mutable_registerstatus()->set_status(
                    REGISTER_INVALID_PASSWORD );
            }
            else
            {
                PasswordEntry * ent = pwd_db->lookupUser(uname);
                if (ent != NULL)
                {
                    srv2cli.mutable_registerstatus()->set_status(
                        REGISTER_DUPLICATE_USERNAME );
                }
                else
                {
                    ent = pwd_db->addUser(uname, pwd);
                    if (ent == NULL)
                    {
                        srv2cli.mutable_registerstatus()->set_status(
                            REGISTER_INVALID_USERNAME );
                    }
                    else
                    {
                        srv2cli.mutable_registerstatus()->set_status(
                            REGISTER_ACCEPT );
                        srv2cli.mutable_registerstatus()->set_token(
                            ent->token );
                    }
                }
            }
        }
        sendClientMessage( srv2cli, false );
    }
    default:
        break;
    }
}
