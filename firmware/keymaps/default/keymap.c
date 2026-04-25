#include QMK_KEYBOARD_H
#include "eeprom.h"

// ================= CONFIG =================
#define NUM_PROFILES 3
#define ROWS 4
#define COLS 5

#define MAX_MACROS 10
#define MACRO_LEN 5

#define EEPROM_MAGIC 0x42

// EEPROM address map:
//   0          = magic byte
//   1          = current profile
//   2          = encoder mode
//   3-9        = reserved
//   10-129     = dynamic keys  (3 profiles * 4 rows * 5 cols * 2 bytes = 120 bytes)
//   130-139    = macro lengths (MAX_MACROS * 1 byte = 10 bytes)
//   140-239    = macro keys    (MAX_MACROS * MACRO_LEN * 2 bytes = 100 bytes)

#define EEPROM_ADDR_MAGIC        0
#define EEPROM_ADDR_PROFILE      1
#define EEPROM_ADDR_MODE         2
#define EEPROM_ADDR_KEYS         10
#define EEPROM_ADDR_MACRO_LENS   130
#define EEPROM_ADDR_MACRO_KEYS   140

// ================= GLOBAL =================
uint8_t current_profile = 0;
uint8_t encoder_mode = 0;

uint16_t dynamic_keys[NUM_PROFILES][ROWS][COLS];

// ================= MACROS =================
uint16_t macros[MAX_MACROS][MACRO_LEN];
uint8_t macro_len[MAX_MACROS];

// ================= DEFAULT =================
uint16_t profiles[NUM_PROFILES][ROWS][COLS] = {
    {
        {KC_7, KC_8, KC_9, KC_PMNS, KC_NO},
        {KC_4, KC_5, KC_6, KC_PPLS, KC_NO},
        {KC_1, KC_2, KC_3, KC_ENT,  KC_NO},
        {KC_0, KC_DOT, KC_MUTE, KC_NO, KC_NO}
    },
    {
        {KC_A, KC_B, KC_C, KC_D, KC_NO},
        {KC_E, KC_F, KC_G, KC_H, KC_NO},
        {KC_I, KC_J, KC_K, KC_L, KC_NO},
        {KC_M, KC_N, KC_O, KC_P, KC_NO}
    },
    {
        {KC_Q, KC_W, KC_E, KC_R, KC_NO},
        {KC_A, KC_S, KC_D, KC_F, KC_NO},
        {KC_Z, KC_X, KC_C, KC_V, KC_NO},
        {KC_NO, KC_NO, KC_NO, KC_NO, KC_NO}
    }
};

// ================= EEPROM =================
void save_to_eeprom(void) {
    eeprom_update_byte((uint8_t*)EEPROM_ADDR_MAGIC,   EEPROM_MAGIC);
    eeprom_update_byte((uint8_t*)EEPROM_ADDR_PROFILE, current_profile);
    eeprom_update_byte((uint8_t*)EEPROM_ADDR_MODE,    encoder_mode);

    // Save dynamic keys
    int idx = EEPROM_ADDR_KEYS;
    for (int p = 0; p < NUM_PROFILES; p++) {
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                uint16_t k = dynamic_keys[p][r][c];
                eeprom_update_byte((uint8_t*)idx,       k & 0xFF);
                eeprom_update_byte((uint8_t*)(idx + 1), k >> 8);
                idx += 2;
            }
        }
    }

    // Save macro lengths
    for (int i = 0; i < MAX_MACROS; i++) {
        eeprom_update_byte((uint8_t*)(EEPROM_ADDR_MACRO_LENS + i), macro_len[i]);
    }

    // Save macro keys
    idx = EEPROM_ADDR_MACRO_KEYS;
    for (int i = 0; i < MAX_MACROS; i++) {
        for (int j = 0; j < MACRO_LEN; j++) {
            uint16_t k = macros[i][j];
            eeprom_update_byte((uint8_t*)idx,       k & 0xFF);
            eeprom_update_byte((uint8_t*)(idx + 1), k >> 8);
            idx += 2;
        }
    }
}

void load_defaults(void) {
    for (int p = 0; p < NUM_PROFILES; p++) {
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                dynamic_keys[p][r][c] = profiles[p][r][c];
            }
        }
    }

    // Clear macros
    for (int i = 0; i < MAX_MACROS; i++) {
        macro_len[i] = 0;
        for (int j = 0; j < MACRO_LEN; j++) {
            macros[i][j] = KC_NO;
        }
    }
}

void load_from_eeprom(void) {
    if (eeprom_read_byte((uint8_t*)EEPROM_ADDR_MAGIC) != EEPROM_MAGIC) {
        load_defaults();
        save_to_eeprom();
        return;
    }

    current_profile = eeprom_read_byte((uint8_t*)EEPROM_ADDR_PROFILE);
    encoder_mode    = eeprom_read_byte((uint8_t*)EEPROM_ADDR_MODE);

    // Load dynamic keys
    int idx = EEPROM_ADDR_KEYS;
    for (int p = 0; p < NUM_PROFILES; p++) {
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                uint8_t lo = eeprom_read_byte((uint8_t*)idx);
                uint8_t hi = eeprom_read_byte((uint8_t*)(idx + 1));
                dynamic_keys[p][r][c] = (hi << 8) | lo;
                idx += 2;
            }
        }
    }

    // Load macro lengths
    for (int i = 0; i < MAX_MACROS; i++) {
        macro_len[i] = eeprom_read_byte((uint8_t*)(EEPROM_ADDR_MACRO_LENS + i));
        // Guard against corrupted length values
        if (macro_len[i] > MACRO_LEN) macro_len[i] = 0;
    }

    // Load macro keys
    idx = EEPROM_ADDR_MACRO_KEYS;
    for (int i = 0; i < MAX_MACROS; i++) {
        for (int j = 0; j < MACRO_LEN; j++) {
            uint8_t lo = eeprom_read_byte((uint8_t*)idx);
            uint8_t hi = eeprom_read_byte((uint8_t*)(idx + 1));
            macros[i][j] = (hi << 8) | lo;
            idx += 2;
        }
    }
}

// ================= MACRO =================
void run_macro(uint8_t id) {
    if (id >= MAX_MACROS) return;
    for (uint8_t i = 0; i < macro_len[id]; i++) {
        tap_code16(macros[id][i]);
        wait_ms(100);
    }
}

// ================= INIT =================
void keyboard_post_init_user(void) {
    load_from_eeprom();
}

// ================= KEYMAP =================
const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [0] = LAYOUT(
        KC_1, KC_2, KC_3, KC_4, KC_5,
        KC_6, KC_7, KC_8, KC_9, KC_0,
        KC_Q, KC_W, KC_E, KC_R, KC_T,
        KC_A, KC_S, KC_D, KC_F, KC_G
    )
};

// ================= ENCODER =================
bool encoder_update_user(uint8_t index, bool clockwise) {
    switch (encoder_mode) {
        case 0:
            clockwise ? tap_code(KC_VOLU) : tap_code(KC_VOLD);
            break;
        case 1:
            clockwise ? tap_code(KC_BRIU) : tap_code(KC_BRID);
            break;
        case 2:
            clockwise ? tap_code(KC_RIGHT) : tap_code(KC_LEFT);
            break;
    }
    return false;
}

// ================= KEY =================
bool process_record_user(uint16_t keycode, keyrecord_t *record) {
    if (record->event.pressed) {
        uint8_t r = record->event.key.row;
        uint8_t c = record->event.key.col;
        uint16_t dyn_key = dynamic_keys[current_profile][r][c];

        if (dyn_key >= 0xF000) {
            run_macro(dyn_key - 0xF000);
        } else {
            tap_code16(dyn_key);
        }
    }
    // Return false on both press and release so QMK doesn't
    // also process the static keymap key on top of the dynamic one.
    return false;
}

// ================= HID =================
void raw_hid_receive(uint8_t *data, uint8_t length) {
    switch (data[0]) {

        case 10: // set encoder mode
            encoder_mode = data[1];
            save_to_eeprom();
            break;

        case 20: // setkey
            if (data[1] < ROWS && data[2] < COLS) {
                uint16_t key = (data[5] << 8) | data[4];
                dynamic_keys[current_profile][data[1]][data[2]] = key;
                save_to_eeprom();
            }
            break;

        case 30: // switch profile
            if (data[1] < NUM_PROFILES) {
                current_profile = data[1];
                save_to_eeprom();
            }
            break;

        case 40: { // set macro
            uint8_t id  = data[1];
            uint8_t len = data[2];

            if (id >= MAX_MACROS || len > MACRO_LEN) return;

            macro_len[id] = len;

            int idx = 3;
            for (uint8_t i = 0; i < len; i++) {
                macros[id][i] = (data[idx + 1] << 8) | data[idx];
                idx += 2;
            }

            save_to_eeprom(); // ← was missing, macros never persisted before
            break;
        }
    }
}