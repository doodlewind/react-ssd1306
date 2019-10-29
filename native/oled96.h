#ifndef OLED96_H
#define OLED96_H
//
// OLED96
// Library for accessing the 0.96" SSD1306 128x64 OLED display
// Written by Larry Bank (bitbank@pobox.com)
// Copyright (c) 2017 BitBank Software, Inc.
// Project started 1/15/2017
//
// OLED type for init function
enum
{
    OLED_128x32 = 1,
    OLED_128x64,
    OLED_132x64,
    OLED_64x32
};

typedef enum
{
    FONT_NORMAL = 0, // 8x8
    FONT_BIG,        // 16x24
    FONT_SMALL       // 6x8
} FONTSIZE;

// Initialize the OLED96 library for a specific I2C address
// Optionally enable inverted or flipped mode
// returns 0 for success, 1 for failure
//
int oledInit(int iChannel, int iAddress, int iType, int bFlip, int bInvert);

// Turns off the display and closes the I2C handle
void oledShutdown(void);

// Fills the display with the byte pattern
int oledFill(unsigned char ucPattern);

// Write a text string to the display at x (column 0-127) and y (row 0-7)
// bLarge = 0 - 8x8 font, bLarge = 1 - 16x24 font
int oledWriteString(int x, int y, char *szText, int bLarge);

// Sets a pixel to On (1) or Off (0)
// Coordinate system is pixels, not text rows (0-127, 0-63)
int oledSetPixel(int x, int y, unsigned char ucPixel);

// Sets the contrast (brightness) level of the display
// Valid values are 0-255 where 0=off and 255=max brightness
int oledSetContrast(unsigned char ucContrast);
#endif // OLED96_H
