#![forbid(unsafe_code)]

mod prelude;

mod config;
mod conn;

use crate::config::Config;

fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    println!("Hello, world!");

    let config = Config::load("nublog.toml")?;
    dbg!(config);

    Ok(())
}
