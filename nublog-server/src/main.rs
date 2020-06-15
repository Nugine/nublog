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

pub mod config {
    use crate::prelude::*;
    #[derive(Debug, Serialize, Deserialize)]
    pub struct Config {
        pub addr: String,
        pub database_url: String,
        pub github_client_id: String,
        pub github_client_secret: String,
        pub root_url: String,
    }

    pub fn load_config(file_path: &str) -> Result<Config> {
        let content = std::fs::read_to_string(file_path)?;
        let config: Config = toml::from_str(&content)?;
        Ok(config)
    }
}

use self::config::Config;
use crate::prelude::*;
use nuclear::core::{App, AppBuilder};
use sqlx::PgPool;

async fn build_app(builder: AppBuilder) -> Result<App> {
    let config: &Config = builder.try_inject_ref()?;

    let pool: PgPool = PgPool::builder()
        .max_size(5)
        .build(&config.database_url)
        .await?;

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

    let config = self::config::load_config("nublog.toml")?;

    let addr = config.addr.clone();

    let app: App = App::resolver()
        .provide(config)
        .try_build_app(build_app)
        .await?;

    app.run(addr).await
}
