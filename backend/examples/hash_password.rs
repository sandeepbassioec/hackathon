// Dev utility: print an Argon2 hash for a password so it can be pasted into
// a seed SQL file or used to manually create a user row.
// Usage: cargo run --example hash_password -- <password>

use argon2::password_hash::{rand_core::OsRng, PasswordHasher, SaltString};
use argon2::Argon2;

fn main() {
    let password = std::env::args().nth(1).unwrap_or_else(|| "password123".to_string());
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default().hash_password(password.as_bytes(), &salt).unwrap();
    println!("{}", hash);
}
