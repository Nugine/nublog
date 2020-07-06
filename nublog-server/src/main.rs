#![forbid(unsafe_code)]

mod prelude;

mod config;
mod conn;
mod error;
mod middlewares;
mod rpc;
mod scopes;

use crate::config::Config;

use anyhow::Result;
use nuclear::core::{App, AppBuilder, InjectorExt, Response};
use nuclear::web::router::SimpleRouter;
use nuclear::{http, web};
use sqlx::PgPool;

async fn build_app(builder: AppBuilder) -> Result<App> {
    let config: &Config = builder.try_inject_ref()?;

    let pg_pool: PgPool = PgPool::builder()
        .max_size(32)
        .build(&config.database.url)
        .await?;

    let router = {
        let mut router = SimpleRouter::new();
        crate::scopes::articles::register(&mut router);
        crate::scopes::users::register(&mut router);
        router
    };

    let catch_any_error = web::error::catch_any(|_| {
        let mut res = Response::empty();
        res.set_status(http::StatusCode::INTERNAL_SERVER_ERROR);
        Ok(res)
    });

    let log_response = crate::middlewares::LogResponse;

    let catch_api_error = web::error::catch_error(crate::error::catch_api_error);

    let app = builder
        .provide(pg_pool)
        .middleware(catch_any_error)
        .middleware(catch_api_error)
        .middleware(log_response)
        .endpoint(router);

    Ok(app)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let config = Config::load("nublog.toml")?;
    let addr = config.server.addr.clone();

    let app: App = App::resolver()
        .provide(config)
        .try_build_app(build_app)
        .await?;

    app.run(addr).await
}
