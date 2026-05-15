#pragma once

// Matrix size
#define MATRIX_ROWS 4
#define MATRIX_COLS 5

// Encoder
#define ENCODER_RESOLUTION 4

// Encoder button
#define ENCODER_BUTTON_PIN GP15

// RAW HID
#define RAW_USAGE_PAGE 0xFF60
#define RAW_USAGE_ID   0x61

// OLED SPI
#define OLED_DRIVER_ENABLE
#define OLED_DISPLAY_128X64

#define OLED_DC_PIN GP4
#define OLED_CS_PIN GP5
#define OLED_RST_PIN GP16

#define SPI_DRIVER SPID0
#define SPI_SCK_PIN GP18
#define SPI_MOSI_PIN GP19

// Optional
#define OLED_TIMEOUT 0
#define OLED_BRIGHTNESS 255