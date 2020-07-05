use crate::prelude::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    server: Server,
    database: Database,
    github: GitHub,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Server {
    addr: String,
    root_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Database {
    url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHub {
    client_id: String,
    client_secret: String,
}

impl Config {
    pub fn load(file_path: &str) -> Result<Self> {
        let content = std::fs::read_to_string(file_path)?;
        let config: Config = toml::from_str(&content)?;
        Ok(config)
    }
}
