#[tauri::command]
fn get_env_var(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| "".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_clipboard_manager::init())
    .invoke_handler(tauri::generate_handler![get_env_var])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
