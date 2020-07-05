use crate::prelude::*;

use std::future::Future;

pub async fn jsonrpc<F, Fut, T, U>(mut req: Request, f: F) -> Result<Json<U>>
where
    F: Fn(Conn, T) -> Fut,
    Fut: Future<Output = Result<U>>,
    T: serde::de::DeserializeOwned,
    U: serde::Serialize,
{
    let dto: T = req.json().await?;
    let conn = req.get_conn().await?;
    let res = f(conn, dto).await?;
    Ok(reply::json(res))
}

pub async fn jsonrpc_query<F, Fut, T, U>(req: Request, f: F) -> Result<Json<U>>
where
    F: Fn(Conn, T) -> Fut,
    Fut: Future<Output = Result<U>>,
    T: serde::de::DeserializeOwned,
    U: serde::Serialize,
{
    let dto: T = req.query()?;
    let conn = req.get_conn().await?;
    let res = f(conn, dto).await?;
    Ok(reply::json(res))
}
