use sqlx::types::chrono;

pub type DateTime = chrono::DateTime<chrono::Utc>;

pub use serde::{Deserialize, Serialize};

pub use crate::repo::Repo;

pub use nuclear::core::Result;

pub type Conn = sqlx::pool::PoolConnection<sqlx::PgConnection>;
