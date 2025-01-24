use napi_derive::napi;
use std::sync::Arc;
use tokio::sync::Mutex;
use hyper::{Body, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};
use std::convert::Infallible;
use std::net::SocketAddr;

type HandlerFn = Arc<dyn Fn(Request<Body>) -> Response<Body> + Send + Sync>;

#[napi]
pub struct RustifyServer {
    port: u16,
    handlers: Arc<Mutex<Vec<(String, HandlerFn)>>>,
}

#[napi]
impl RustifyServer {
    #[napi(constructor)]
    pub fn new(port: u16) -> Self {
        RustifyServer {
            port,
            handlers: Arc::new(Mutex::new(Vec::new())),
        }
    }

    #[napi]
    pub async fn start(&self) -> Result<(), napi::Error> {
        let addr = SocketAddr::from(([127, 0, 0, 1], self.port));
        let handlers = Arc::clone(&self.handlers);

        let make_svc = make_service_fn(move |_conn| {
            let handlers = Arc::clone(&handlers);
            async move {
                Ok::<_, Infallible>(service_fn(move |req| {
                    let handlers = Arc::clone(&handlers);
                    async move {
                        let handlers = handlers.lock().await;
                        for (path, handler) in handlers.iter() {
                            if req.uri().path() == path {
                                return Ok::<_, Infallible>(handler(req));
                            }
                        }
                        
                        Ok(Response::builder()
                            .status(404)
                            .body(Body::from("Not Found"))
                            .unwrap())
                    }
                }))
            }
        });

        let server = Server::bind(&addr).serve(make_svc);
        
        if let Err(e) = server.await {
            return Err(napi::Error::from_reason(format!("Server error: {}", e)));
        }

        Ok(())
    }

    #[napi]
    pub async fn add_route(&self, path: String, handler: napi::JsFunction) -> Result<(), napi::Error> {
        let mut handlers = self.handlers.lock().await;
        let handler_fn = Arc::new(move |req: Request<Body>| {
            // Convert request to JS-friendly format and call handler
            Response::new(Body::from("Hello from Rust!"))
        });
        
        handlers.push((path, handler_fn));
        Ok(())
    }
} 