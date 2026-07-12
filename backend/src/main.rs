mod auth;
mod db;
mod models;
mod routes;

use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    let pool = db::connect().await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let app = routes::build(pool).layer(CorsLayer::permissive());

    let port: u16 = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string()).parse()?;
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", port)).await?;
    tracing::info!("listening on {port}");
    axum::serve(listener, app).await?;

    Ok(())
}
