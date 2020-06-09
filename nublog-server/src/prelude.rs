use sqlx::types::chrono;

pub type DateTime = chrono::DateTime<chrono::Utc>;

pub use serde::{Deserialize, Serialize};

pub use crate::repo::Repo;

pub use nuclear::core::Result;

pub type Conn = sqlx::pool::PoolConnection<sqlx::PgConnection>;

#[macro_export]
macro_rules! create {
    ($ty:tt from $e:tt by $($field:tt),+) => {{
        $ty{
            $($field: $e.$field),+
        }
    }};
}
