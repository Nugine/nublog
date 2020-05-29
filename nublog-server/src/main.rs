use nuclear::core::{App, Result};
use nuclear::web;

#[tokio::main]
async fn main() -> Result<()> {
    println!("Hello, world!");

    let addr = "127.0.0.1:8000";

    let app = App::builder().endpoint(|_| async { web::reply::text("hello world") });

    app.run(addr).await
}
