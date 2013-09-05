/* -*- Mode:c++; eval:(c-set-style "BSD"); c-basic-offset:4; indent-tabs-mode:nil; tab-width:8 -*-  */

#ifndef __PASSWORD_DATABASE_H__
#define __PASSWORD_DATABASE_H__ 1

#include <time.h>
#include <string>
#include <list>

#define DB_FILE "/home/web/pfkchat_password_database"
#define HTPASSWD_CMD "/home/web/bin/htpasswd.py"
#define PFKCHAT_HTPASSWD "/home/web/pfkchat.htpasswd"

struct PasswordEntry {
    std::string username;
    std::string password;
    std::string token;
    time_t expire_time;
};

class PasswordDatabase {
    static const int tokenLength = 32;
    std::list<PasswordEntry*> database;
    void sync(void);
public:
    PasswordDatabase(void);
    ~PasswordDatabase(void);
    PasswordEntry * lookupUser( std::string username );
    void newToken(PasswordEntry *);
    PasswordEntry * addUser( std::string username, std::string password );
};

#endif /* __PASSWORD_DATABASE_H__ */
