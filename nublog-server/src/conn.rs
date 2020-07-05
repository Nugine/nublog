use nuclear::core::{async_trait, InjectorExt, Request, Result};

pub type Conn = sqlx::pool::PoolConnection<sqlx::PgConnection>;

#[async_trait]
pub trait PgConnExt {
    fn get_pool(&self) -> Result<&sqlx::PgPool>;

    async fn get_conn(&self) -> Result<Conn> {
        Ok(self.get_pool()?.acquire().await?)
    }
}

impl PgConnExt for Request {
    fn get_pool(&self) -> Result<&sqlx::PgPool> {
        Ok(self.try_inject_ref::<sqlx::PgPool>()?)
    }
}
