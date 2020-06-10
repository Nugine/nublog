mod conn;
mod prelude;
mod scopes;
mod session;

fn main() {
    println!("hello");
}
// use nuclear::core::{App, InjectorExt, Request, Result};
// use nuclear::web;

// use sqlx::postgres::{PgPool, PgQueryAs};
// use std::env;

// async fn hello(req: Request) -> Result<web::reply::Json<Vec<(i32,)>>> {
//     let pool: &PgPool = req.try_inject_ref()?;
//     let ret: Vec<(i32,)> = sqlx::query_as("SELECT id FROM articles")
//         .fetch_all(pool)
//         .await?;
//     Ok(web::reply::json(ret))
// }

// #[tokio::main]
// async fn main() -> Result<()> {
//     dotenv::dotenv().ok();
//     env_logger::init();

//     let db_url = env::var("DATABASE_URL")?;

//     let pool: PgPool = PgPool::builder().max_size(5).build(&db_url).await?;

//     dbg!(db_url);

//     let addr = "127.0.0.1:8000";

//     let app: App = App::resolver()
//         .provide(pool)
//         .try_build_app(|b| async {
//             dbg!(b.injector());
//             let app = b.middleware(web::error::display500()).endpoint(hello);
//             Ok(app)
//         })
//         .await?;

//     app.run(addr).await
// }
