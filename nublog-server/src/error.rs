#[derive(Debug, thiserror::Error)]
#[error("Not Found")]
pub struct NotFoundError;
