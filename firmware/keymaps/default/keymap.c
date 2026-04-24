// Copyright 2023 QMK
// SPDX-License-Identifier: GPL-2.0-or-later

#include QMK_KEYBOARD_H

// ================= DYNAMIC KEY STORAGE =================
uint16_t dynamic_keys[4][5] = {
    {KC_7, KC_8, KC_9, KC_PMNS, KC_NO},
    {KC_4, KC_5, KC_6, KC_PPLS, KC_NO},
    {KC_1, KC_2, KC_3, KC_ENT,  KC_NO},
    {KC_0, KC_DOT, KC_MUTE, KC_NO, KC_NO}
};

// ================= ENCODER MODE =================
static uint8_t encoder_mode = 0;

// ================= SEND TO PC =================
void send_to_pc(uint8_t cmd, uint8_t value) {
    uint8_t data[32] = {0};
    data[0] = cmd;
    data[1] = value;

    host_raw_hid_send(data, 32);
}

// ================= KEYMAP (dummy, actual handled manually) =================
const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [0] = LAYOUT(
        KC_NO, KC_NO, KC_NO, KC_NO, KC_NO,
        KC_NO, KC_NO, KC_NO, KC_NO, KC_NO,
        KC_NO, KC_NO, KC_NO, KC_NO, KC_NO,
        KC_NO, KC_NO, KC_NO, KC_NO, KC_NO
    )
};

// ================= ENCODER =================
bool encoder_update_user(uint8_t index, bool clockwise) {

    switch (encoder_mode) {

        case 0: // volume
            if (clockwise) tap_code(KC_VOLU);
            else tap_code(KC_VOLD);
            break;

        case 1: // brightness
            if (clockwise) tap_code(KC_BRIU);
            else tap_code(KC_BRID);
            break;

        case 2: // arrows
            if (clockwise) tap_code(KC_RIGHT);
            else tap_code(KC_LEFT);
            break;
    }

    // also send to PC
    send_to_pc(1, clockwise ? 1 : 0);

    return false;
}

// ================= KEY HANDLING =================
bool process_record_user(uint16_t keycode, keyrecord_t *record) {

    if (record->event.pressed) {

        uint8_t row = record->event.key.row;
        uint8_t col = record->event.key.col;

        uint16_t dyn_key = dynamic_keys[row][col];

        tap_code16(dyn_key);

        send_to_pc(2, dyn_key);

        return false; // stop default
    }

    return true;
}

// ================= RECEIVE FROM PC =================
void raw_hid_receive(uint8_t *data, uint8_t length) {

    switch (data[0]) {

        case 10:  // change encoder mode
            encoder_mode = data[1];
            break;

        case 20:  // set key
            dynamic_keys[data[1]][data[2]] = data[3];
            break;

        case 1:
            tap_code(KC_MUTE);
            break;

        case 2:
            tap_code(KC_VOLU);
            break;

        case 3:
            tap_code(KC_VOLD);
            break;
    }
}