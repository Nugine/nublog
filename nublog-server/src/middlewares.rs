use crate::prelude::*;

use nuclear::core::{Middleware, Next};

pub struct LogResponse;

#[async_trait]
impl Middleware for LogResponse {
    async fn call(&self, req: Request, next: Next<'_>) -> Result<Response> {
        let method = req.method().to_string();
        let url = req.uri().to_string();
        let ret = next.call(req).await;
        match ret.as_ref() {
            Ok(res) => log::info!("{} {:?} => {:?}", method, url, res.status().to_string()),
            Err(e) => log::error!("{} {:?} => Error: {}", method, url, e),
        }
        ret
    }
}
