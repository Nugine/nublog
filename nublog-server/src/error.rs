use crate::prelude::*;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("NotFound")]
    NotFound = 1001,

    #[error("NoSession")]
    NoSession = 1002,

    #[error("NoPermission")]
    NoPermission = 1003,
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiErrorRes<'a> {
    code: u16,
    message: &'a str,
}

pub fn catch_api_error(e: ApiError) -> Result<Response> {
    let mut res: Response = Response::empty();

    match &e {
        ApiError::NotFound => {
            res.set_status(http::StatusCode::NOT_FOUND);
        }
        ApiError::NoSession | ApiError::NoPermission => {
            res.set_status(http::StatusCode::FORBIDDEN);
        }
    };

    let message = e.to_string();
    let body = ApiErrorRes {
        code: e as u16,
        message: message.as_str(),
    };

    *res.body_mut() = serde_json::to_string(&body)?.into();

    Ok(res)
}
