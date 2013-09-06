
proto= /home/web
proto2js= /home/web/bin/proto2js
protoc= $(proto)/bin/protoc
libs= -L$(proto)/lib -lprotobuf -lpthread
incs= -I$(proto)/include
flags= -Wall -Werror -g
jsproto_login= $(proto)/html-secure/pfkchat-login-messages.js
jsproto_full= $(proto)/html-secure/pfkchat/messages.js

OBJS= WebSocketConnection.o WebSocketServer.o \
	base64.o md5.o sha1.o pfkchat-messages.pb.o \
	chatConnection.o passwordDatabase.o main.o

DEPS= $(OBJS:.o=.d)

all: xmakefile
	make -j 8 -f xmakefile pfkchat_ws

xmakefile: Makefile pfkchat-protoversion.h $(DEPS) 
	rm -f xmakefile xmakefile-tmp
	cat Makefile > xmakefile-tmp
	echo '' >> xmakefile-tmp
	cat $(DEPS) >> xmakefile-tmp
	mv xmakefile-tmp xmakefile

.SUFFIXES: .c .cc .d

.c.d:
	gcc $(incs) -M $*.c > $*.d

.cc.d:
	g++ $(incs) -M $*.cc > $*.d

pfkchat_ws: $(OBJS)
	g++ $(OBJS) $(libs) -o pfkchat_ws
	rm -f vers

pfkchat-protoversion.h: vers
	echo "#define PFK_CHAT_CurrentProtoVersion `cat vers`" > pfkchat-protoversion.h

vers:
	echo -n 0x > vers
	random_hex 7 >> vers

pfkchat-messages.pb.cc pfkchat-messages.pb.h: pfkchat-messages-all.proto vers
	cpp -DFULL_MSG_SET < pfkchat-messages-all.proto | grep -v ^# > pfkchat-messages.proto
	$(protoc) --cpp_out=. pfkchat-messages.proto
	rm -f pfkchat-messages.proto
	cpp < pfkchat-messages-all.proto | grep -v ^# > pfkchat-login-messages.proto
	$(proto2js) pfkchat-login-messages.proto -class > $(jsproto_login)
	echo "; PFK.Chat.CurrentProtoVersion = `cat vers`;" >> $(jsproto_login)
	cpp -DFULL_MSG_SET < pfkchat-messages-all.proto | grep -v ^# > pfkchat-login-messages.proto
	$(proto2js) pfkchat-login-messages.proto -class > $(jsproto_full)
	echo "; PFK.Chat.CurrentProtoVersion = `cat vers`;" >> $(jsproto_full)
	rm -f pfkchat-login-messages.proto

.cc.o:
	g++ $(incs) $(flags) -c $*.cc

.c.o:
	gcc $(incs) $(flags) -c $*.c

clean:
	rm -f *.o *.d *.pb.cc *.pb.h pfkchat_ws vers *~ xmakefile
	rm -f pfkchat-protoversion.h
