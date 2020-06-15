use crate::prelude::*;

#[derive(Debug, Clone)]
pub struct Session {
    pub id: Uuid,
    pub user_id: i32,
    pub role_code: i32,
    pub create_at: DateTime,
}

#[derive(Debug, thiserror::Error)]
#[error("MissingSessionError")]
pub struct MissingSessionError;

pub trait SessionExt {
    fn try_get_session_ref(&self) -> Result<&Session, MissingSessionError>;
}

impl SessionExt for Request {
    fn try_get_session_ref(&self) -> Result<&Session, MissingSessionError> {
        self.local().get().ok_or_else(|| MissingSessionError)
    }
}

pub struct SessionStore {
    _priv: (),
}

pub fn session_store() -> SessionStore {
    SessionStore { _priv: () }
}

#[async_trait]
impl Middleware for SessionStore {
    async fn call(&self, mut req: Request, next: Next<'_>) -> Result<Response> {
        let token = req
            .headers_mut()
            .get(http::header::HeaderName::from_static("x-session-id"));

        if let Some(token) = token {
            let token = token.to_str()?;
            let sess_id: Uuid = token.parse()?;

            let mut conn: Conn = req.get_conn().await?;
            let sess: Option<Session> =
                sqlx::query_as!(Session, "SELECT * FROM sessions WHERE id = $1", sess_id)
                    .fetch_optional(&mut conn)
                    .await?;

            if let Some(sess) = sess {
                req.local_mut().insert(sess);
            }
        }

        next.call(req).await
    }
}
