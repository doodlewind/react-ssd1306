OBJDIR=.obj
CC=gcc
CFLAGS=-g -Wall -MMD -MF $(OBJDIR)/$(@F).d -Wno-array-bounds
LDFLAGS=-flto
CFLAGS_OPT=$(CFLAGS) -O2 -flto
DEFINES:=-D_GNU_SOURCE
CFLAGS+=$(DEFINES)

LIBS=/usr/local/lib/quickjs/libquickjs.a
INCLUDES=-I/usr/local/include/quickjs

$(OBJDIR):
	mkdir -p $(OBJDIR)

main: $(OBJDIR) $(OBJDIR)/process.o $(OBJDIR)/main.o
	$(CC) $(LDFLAGS) $(CFLAGS_OPT) -o $@ $(OBJDIR)/main.o $(OBJDIR)/process.o $(LIBS) -lm -ldl
	strip main

$(OBJDIR)/process.o: process.c
	$(CC) $(LDFLAGS) $(CFLAGS_OPT) -c $(INCLUDES) -o $@ process.c

$(OBJDIR)/main.o: main.c
	$(CC) $(LDFLAGS) $(CFLAGS_OPT) -c $(INCLUDES) -o $@ main.c

main.c: main.js
	qjsc -flto -e -M process,process -m -o $@ main.js

clean:
	rm ./main
	rm main.c
	rm -rf $(OBJDIR)