use std::path::{Path, PathBuf};
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn get_env_var(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| "".to_string())
}

fn home_dir() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        std::env::var_os("USERPROFILE").map(PathBuf::from)
    }
    #[cfg(not(windows))]
    {
        std::env::var_os("HOME").map(PathBuf::from)
    }
}

fn strip_verbatim(path: PathBuf) -> PathBuf {
    let text = path.to_string_lossy();
    match text.strip_prefix(r"\\?\") {
        Some(rest) => PathBuf::from(rest),
        None => path,
    }
}

fn is_within(path: &Path, protected: &Path) -> bool {
    path == protected || path.starts_with(protected)
}

#[allow(dead_code)]
const PROTECTED_UNIX: &[&str] = &[
    "/etc", "/usr", "/bin", "/sbin", "/lib", "/lib64", "/boot", "/proc", "/sys", "/dev", "/var",
];

#[allow(dead_code)]
const PROTECTED_WINDOWS: &[&str] = &[
    r"C:\Windows",
    r"C:\Program Files",
    r"C:\Program Files (x86)",
    r"C:\ProgramData",
];

fn is_protected(path: &Path) -> bool {
    if path.parent().is_none() {
        return true;
    }

    if let Some(home) = home_dir() {
        let home = strip_verbatim(
            std::fs::canonicalize(&home).unwrap_or(home),
        );
        if home.starts_with(path) {
            return true;
        }
    }

    #[cfg(unix)]
    for entry in PROTECTED_UNIX {
        if is_within(path, Path::new(entry)) {
            return true;
        }
    }

    #[cfg(windows)]
    for entry in PROTECTED_WINDOWS {
        if is_within(path, Path::new(entry)) {
            return true;
        }
    }

    false
}

#[tauri::command]
fn allow_folder(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let canonical = std::fs::canonicalize(&path)
        .map(strip_verbatim)
        .map_err(|e| format!("Cannot resolve folder \"{path}\": {e}"))?;

    if is_protected(&canonical) {
        log::warn!("Refused to grant access to protected folder: {canonical:?}");
        return Err(format!(
            "Refused to grant access to protected folder: {}",
            canonical.display()
        ));
    }

    app.fs_scope()
        .allow_directory(&canonical, true)
        .map_err(|e| e.to_string())?;

    log::info!("Granted folder access: {canonical:?}");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![get_env_var, allow_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
