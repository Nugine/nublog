use crate::prelude::*;
use std::marker::PhantomData;

pub struct Repo<E> {
    pool: sqlx::PgPool,
    _marker: PhantomData<fn() -> E>,
}

impl<E> Repo<E> {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self {
            pool,
            _marker: PhantomData,
        }
    }

    pub async fn get_conn(&self) -> Result<Conn> {
        Ok(self.pool.acquire().await?)
    }
}
