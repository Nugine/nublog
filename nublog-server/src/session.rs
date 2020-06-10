use nuclear::core::{InjectorExt, Request, Result};

pub struct Session {
    pub id: i32,
    pub expire_time: u32,
    pub user_id: i32,
    pub role_code: i32,
}

#[derive(Debug, thiserror::Error)]
#[error("MissingSessionError")]
pub struct MissingSessionError;

pub trait SessionExt {
    fn try_get_session_ref(&self) -> Result<&Session, MissingSessionError>;
}

impl SessionExt for Request {
    fn try_get_session_ref(&self) -> Result<&Session, MissingSessionError> {
        self.try_inject_ref().map_err(|_| MissingSessionError)
    }
}
