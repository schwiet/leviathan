
#include "passwordDatabase.h"

#include <stdlib.h>
#include <iostream>
#include <fstream>

using namespace std;

PasswordDatabase :: PasswordDatabase(void)
{
    ifstream  ifs(DB_FILE, ios::in);
    if (ifs.is_open())
    {
        string  uname, passwd, tok;
        while (1)
        {
            ifs >> uname >> passwd >> tok;
            if (!ifs.good())
                break;
            PasswordEntry * ent = new PasswordEntry;
            ent->username = uname;
            ent->password = passwd;
            database.push_back(ent);
        }
    }
}

PasswordDatabase :: ~PasswordDatabase(void)
{
    sync();
}

PasswordEntry *
PasswordDatabase :: lookupUser( std::string username )
{
    list<PasswordEntry*>::iterator   it;
    for (it = database.begin(); it != database.end(); it++)
    {
        PasswordEntry * ent = *it;
        if (ent->username == username)
            return ent;
    }
    return NULL;
}

static const char tokenSet[] = 
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

void
PasswordDatabase :: newToken(PasswordEntry *ent)
{
    string token;
    int c;

    for (c = 0; c < tokenLength; c++)
        token += tokenSet[random() % (sizeof(tokenSet)-1)];
    ent->token = token;
    sync();

    string cmdline;

    cmdline = HTPASSWD_CMD " -b " PFKCHAT_HTPASSWD " ";
    cmdline += ent->username;
    cmdline += " ";
    cmdline += ent->token;

    system(cmdline.c_str());
}

PasswordEntry *
PasswordDatabase :: addUser( std::string username, std::string password )
{
    PasswordEntry * ent;

    ent = new PasswordEntry;
    ent->username = username;
    ent->password = password;
    database.push_back(ent);
    newToken(ent);

    return ent;
}

void
PasswordDatabase :: sync(void)
{
    ofstream  ofs(DB_FILE, ios::out | ios::trunc);
    list<PasswordEntry*>::iterator  it;
    for (it = database.begin(); it != database.end(); it++)
    {
        PasswordEntry * ent = *it;
        ofs
            << ent->username << " "
            << ent->password << " "
            << ent->token    << endl;
    }
}
