use crate::prelude::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub server: Server,
    pub database: Database,
    pub github: GitHub,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Server {
    pub addr: String,
    pub root_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Database {
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHub {
    pub client_id: String,
    pub client_secret: String,
}

impl Config {
    pub fn load(file_path: &str) -> Result<Self> {
        let content = std::fs::read_to_string(file_path)?;
        let config: Config = toml::from_str(&content)?;
        Ok(config)
    }
}
