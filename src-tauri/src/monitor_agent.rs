use tauri::Manager;

/// Self-contained, always-on screenshot agent.
///
/// Mounted by `lib.rs` through four calls in `run()`:
/// `configure` (plugins), `setup` (autostart + hidden launch),
/// `on_window_event` (close-to-hide), and its two commands
/// (`capture_screens`, `screen_info`). To unmount the feature, delete this
/// file and those references plus the matching Cargo dependencies.

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenInfo {
    monitors: usize,
    width: u32,
    height: u32,
}

struct ScreenBounds {
    min_x: i32,
    min_y: i32,
    width: u32,
    height: u32,
}

fn monitor_list() -> Result<Vec<xcap::Monitor>, String> {
    let monitors = xcap::Monitor::all().map_err(|e| e.to_string())?;
    if monitors.is_empty() {
        return Err("No monitors found".into());
    }
    Ok(monitors)
}

/// The bounding box of every monitor in virtual-desktop coordinates, so all
/// displays can be stitched onto a single canvas.
fn monitor_bounds(monitors: &[xcap::Monitor]) -> Result<ScreenBounds, String> {
    let mut min_x = i32::MAX;
    let mut min_y = i32::MAX;
    let mut max_x = i32::MIN;
    let mut max_y = i32::MIN;

    for monitor in monitors {
        let x = monitor.x().map_err(|e| e.to_string())?;
        let y = monitor.y().map_err(|e| e.to_string())?;
        let width = monitor.width().map_err(|e| e.to_string())? as i32;
        let height = monitor.height().map_err(|e| e.to_string())? as i32;
        min_x = min_x.min(x);
        min_y = min_y.min(y);
        max_x = max_x.max(x + width);
        max_y = max_y.max(y + height);
    }

    Ok(ScreenBounds {
        min_x,
        min_y,
        width: (max_x - min_x).max(0) as u32,
        height: (max_y - min_y).max(0) as u32,
    })
}

#[tauri::command]
pub fn screen_info() -> Result<ScreenInfo, String> {
    let monitors = monitor_list()?;
    let bounds = monitor_bounds(&monitors)?;
    Ok(ScreenInfo {
        monitors: monitors.len(),
        width: bounds.width,
        height: bounds.height,
    })
}

fn capture_stitched_png() -> Result<Vec<u8>, String> {
    use image::ImageEncoder;

    let monitors = monitor_list()?;
    let bounds = monitor_bounds(&monitors)?;

    let mut canvas = image::RgbaImage::new(bounds.width, bounds.height);
    for monitor in &monitors {
        let image = monitor.capture_image().map_err(|e| e.to_string())?;
        let x = (monitor.x().map_err(|e| e.to_string())? - bounds.min_x) as i64;
        let y = (monitor.y().map_err(|e| e.to_string())? - bounds.min_y) as i64;
        image::imageops::replace(&mut canvas, &image, x, y);
    }

    let mut buffer = Vec::new();
    image::codecs::png::PngEncoder::new(&mut buffer)
        .write_image(
            canvas.as_raw(),
            bounds.width,
            bounds.height,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| e.to_string())?;

    Ok(buffer)
}

/// Captures every monitor, stitched into one PNG returned as raw bytes (an
/// `ArrayBuffer` in the webview). Kept native because the frontend cannot read
/// the screen.
#[tauri::command]
pub fn capture_screens() -> Result<tauri::ipc::Response, String> {
    Ok(tauri::ipc::Response::new(capture_stitched_png()?))
}

/// Shows and focuses the main window (used when a second launch hands off here).
pub fn focus_main<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// Always-on background plumbing: a single-instance guard so a second launch
/// re-focuses the running app, and autostart at login.
pub fn configure<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    builder
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            focus_main(app);
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
}

/// Enables autostart and hides the window when launched with `--hidden`.
pub fn setup(app: &mut tauri::App) -> tauri::Result<()> {
    use tauri_plugin_autostart::ManagerExt;

    let _ = app.autolaunch().enable();

    if std::env::args().any(|arg| arg == "--hidden") {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }
    }

    Ok(())
}

/// Keeps the app alive when the window is closed, so the agent stays reachable.
pub fn on_window_event<R: tauri::Runtime>(window: &tauri::Window<R>, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
    }
}
