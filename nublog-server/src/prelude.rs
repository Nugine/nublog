use sqlx::types::chrono;

pub type DateTime = chrono::DateTime<chrono::Utc>;

pub use serde::{Deserialize, Serialize};
