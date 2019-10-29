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

main: $(OBJDIR) $(OBJDIR)/renderer.o $(OBJDIR)/main.o $(OBJDIR)/oled96.o $(OBJDIR)/fonts.o
	$(CC) $(LDFLAGS) $(CFLAGS_OPT) -o $@ \
	$(OBJDIR)/renderer.o $(OBJDIR)/main.o $(OBJDIR)/oled96.o $(OBJDIR)/fonts.o \
	$(LIBS) -lm -ldl
	strip main

$(OBJDIR)/renderer.o: renderer.c
	$(CC) $(LDFLAGS) $(CFLAGS_OPT) -c $(INCLUDES) -o $@ renderer.c

$(OBJDIR)/oled96.o: oled96.c
	$(CC) $(CFLAGS_OPT) -c -o $@ oled96.c

$(OBJDIR)/fonts.o: fonts.c
	$(CC) $(CFLAGS_OPT) -c -o $@ fonts.c

$(OBJDIR)/main.o: main.c
	$(CC) $(LDFLAGS) $(CFLAGS_OPT) -c $(INCLUDES) -o $@ main.c

main.c: main.js
	qjsc -flto -e -M renderer,renderer -m -o $@ main.js

clean:
	rm ./main
	rm main.c
	rm -rf $(OBJDIR)