use app_lib::hid;
use std::io::{self, Write};

fn main() {
    println!("HID CLI ready. Type 'help' or 'exit'.");

    loop {
        print!(">> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();

        let input = input.trim();
        let parts: Vec<&str> = input.split_whitespace().collect();

        if parts.is_empty() {
            continue;
        }

        match parts[0] {
            "exit" => break,

            "help" => {
                println!("Commands:");
                println!("  version");
                println!("  getprofile");
                println!("  setprofile <0-4>");
                println!("  setkey <profile> <row> <col> <value>");
                println!("  save");
            }

            "version" => {
                match hid::get_version() {
                    Ok(v) => println!("✔ Version: {}", v),
                    Err(e) => println!("❌ {}", e),
                }
            }

            "getprofile" => {
                match hid::get_profile() {
                    Ok(p) => println!("✔ Profile: {}", p),
                    Err(e) => println!("❌ {}", e),
                }
            }

            "setprofile" => {
                if parts.len() < 2 {
                    println!("Usage: setprofile <0-4>");
                    continue;
                }
                let p = parts[1].parse::<u8>().unwrap_or(0);
                match hid::set_profile(p) {
                    Ok(_) => println!("✔ Switched"),
                    Err(e) => println!("❌ {}", e),
                }
            }

            "setkey" => {
                if parts.len() < 5 {
                    println!("Usage: setkey <profile> <row> <col> <value>");
                    continue;
                }

                let profile = parts[1].parse::<u8>().unwrap_or(0);
                let row = parts[2].parse::<u8>().unwrap_or(0);
                let col = parts[3].parse::<u8>().unwrap_or(0);
                let val = u16::from_str_radix(parts[4], 16).unwrap_or(0);

                match hid::set_key(profile, row, col, val) {
                    Ok(_) => println!("✔ Key set"),
                    Err(e) => println!("❌ {}", e),
                }
            }

            "save" => {
                match hid::save_to_device() {
                    Ok(_) => println!("✔ Saved"),
                    Err(e) => println!("❌ {}", e),
                }
            }

            _ => println!("Unknown command"),
        }
    }

    println!("Exiting.");
}