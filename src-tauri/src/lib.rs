#[tauri::command]
fn get_env_var(name: &str) -> String {
    std::env::var(name).unwrap_or_else(|_| "".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_env_var])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
