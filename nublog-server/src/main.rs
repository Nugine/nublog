mod conn;
mod prelude;
mod scopes;
mod session;

pub mod middleware {
    use crate::prelude::*;

    pub struct LogHandler;

    #[async_trait]
    impl Middleware for LogHandler {
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
}

use crate::prelude::*;
use nuclear::core::{App, AppBuilder};
use sqlx::PgPool;

async fn build_app(builder: AppBuilder) -> Result<App> {
    let db_url = std::env::var("DATABASE_URL")?;
    let pool: PgPool = PgPool::builder().max_size(5).build(&db_url).await?;

    let mut router = SimpleRouter::new();
    crate::scopes::articles::register(&mut router);
    crate::scopes::comments::register(&mut router);
    crate::scopes::tags::register(&mut router);
    crate::scopes::users::register(&mut router);

    let catch_session = |e: MissingSessionError| {
        let mut res = Response::new(e.to_string());
        res.set_status(http::StatusCode::FORBIDDEN);
        Result::Ok(res)
    };

    let app = builder
        .provide(pool)
        .middleware(catch_any(|_| {
            let mut res = Response::new("WebError");
            res.set_status(http::StatusCode::INTERNAL_SERVER_ERROR);
            Ok(res)
        }))
        .middleware(self::middleware::LogHandler)
        .middleware(catch_error(catch_session))
        .middleware(session_store())
        .endpoint(router);

    Ok(app)
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let addr = std::env::var("NUBLOG_SERVER_ADDR")?;

    let app: App = App::resolver().try_build_app(build_app).await?;

    app.run(addr).await
}
