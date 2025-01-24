use wasm_bindgen::prelude::*;
use web_sys::{Request, Response, RequestInit};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::rc::Rc;

#[derive(Serialize, Deserialize)]
pub struct RouteConfig {
    path: String,
    method: String,
}

type HandlerFn = Box<dyn Fn(Request) -> Result<Response, JsValue>>;

#[wasm_bindgen]
pub struct RustifyServer {
    port: u16,
    routes: Rc<Mutex<HashMap<String, HandlerFn>>>,
}

#[wasm_bindgen]
impl RustifyServer {
    #[wasm_bindgen(constructor)]
    pub fn new(port: u16) -> Self {
        RustifyServer {
            port,
            routes: Rc::new(Mutex::new(HashMap::new())),
        }
    }

    #[wasm_bindgen]
    pub fn add_route(&self, path: String, method: String, handler: js_sys::Function) -> Result<(), JsValue> {
        let mut routes = self.routes.lock().unwrap();
        let key = format!("{} {}", method, path);
        
        let handler_fn = Box::new(move |req: Request| {
            let resp = Response::new_with_opt_str(Some("Hello from Rust!"))?;
            Ok(resp)
        });

        routes.insert(key, handler_fn);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn handle_request(&self, req: Request) -> Result<Response, JsValue> {
        let routes = self.routes.lock().unwrap();
        let path = req.url();
        let method = req.method();
        let key = format!("{} {}", method, path);

        if let Some(handler) = routes.get(&key) {
            handler(req)
        } else {
            Response::new_with_opt_str(Some("Not Found")).map_err(Into::into)
        }
    }
} 