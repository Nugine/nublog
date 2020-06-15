use crate::prelude::*;
use std::collections::HashMap;
use std::time::SystemTime;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct Session {
    pub id: Uuid,
    pub expire_time: SystemTime,
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
        self.local().get().ok_or_else(|| MissingSessionError)
    }
}

pub struct SessionStore {
    map: RwLock<HashMap<Uuid, Session>>,
}

pub fn session_store() -> SessionStore {
    SessionStore {
        map: RwLock::new(HashMap::new()),
    }
}

#[async_trait]
impl Middleware for SessionStore {
    async fn call(&self, mut req: Request, next: Next<'_>) -> Result<Response> {
        let token = req
            .headers_mut()
            .get(http::header::HeaderName::from_static("X-SESSION-ID"));

        if let Some(token) = token {
            let token = token.to_str()?;
            let sess_id: Uuid = token.parse()?;
            if let Some(sess) = self.map.read().await.get(&sess_id) {
                req.local_mut().insert(sess.clone());
            }
        }

        let res: Response = next.call(req).await?;
        if let Some(sess) = res.local().get::<Session>() {
            self.map.write().await.insert(sess.id.clone(), sess.clone());
        }

        Ok(res)
    }
}
