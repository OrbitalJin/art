use std::path::{Path, PathBuf};
use tauri_plugin_fs::FsExt;

mod monitor_agent;

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

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct CaptionData {
    language: Option<String>,
    title: Option<String>,
    length_seconds: Option<u64>,
    other_languages: Vec<String>,
    json3: serde_json::Value,
}

#[derive(serde::Deserialize)]
struct CaptionTrack {
    #[serde(rename = "baseUrl")]
    base_url: String,
    #[serde(rename = "languageCode")]
    language_code: Option<String>,
    kind: Option<String>,
}

const ANDROID_UA: &str = "com.google.android.youtube/20.10.38 (Linux; U; Android 14)";
const PLAYER_URL: &str = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

/// Fetches a video's caption track via the InnerTube ANDROID client and returns
/// the `fmt=json3` payload plus the metadata needed to build a transcript.
///
/// This runs in Rust (reqwest) rather than through `tauri-plugin-http` because
/// the plugin always attaches the webview's `Origin`, which YouTube's player
/// endpoint rejects with a 403.
#[tauri::command]
async fn fetch_youtube_captions(
    video_id: String,
    lang: Option<String>,
) -> Result<CaptionData, String> {
    let client = reqwest::Client::new();
    let hl = lang.clone().unwrap_or_else(|| "en".to_string());

    let player: serde_json::Value = client
        .post(PLAYER_URL)
        .header(reqwest::header::CONTENT_TYPE, "application/json")
        .header(reqwest::header::USER_AGENT, ANDROID_UA)
        .json(&serde_json::json!({
            "context": { "client": {
                "clientName": "ANDROID",
                "clientVersion": "20.10.38",
                "hl": hl,
            }},
            "videoId": video_id,
        }))
        .send()
        .await
        .map_err(|e| format!("player request failed: {e}"))?
        .error_for_status()
        .map_err(|e| format!("player request failed: {e}"))?
        .json()
        .await
        .map_err(|e| format!("player parse failed: {e}"))?;

    if let Some(status) = player
        .pointer("/playabilityStatus/status")
        .and_then(|v| v.as_str())
    {
        if status != "OK" {
            let reason = player
                .pointer("/playabilityStatus/reason")
                .and_then(|v| v.as_str())
                .unwrap_or(status);
            return Err(format!("Video unavailable: {reason}"));
        }
    }

    let tracks: Vec<CaptionTrack> = serde_json::from_value(
        player
            .pointer("/captions/playerCaptionsTracklistRenderer/captionTracks")
            .cloned()
            .unwrap_or(serde_json::Value::Null),
    )
    .map_err(|_| "Could not read caption tracks".to_string())?;

    if tracks.is_empty() {
        return Err("This video has no captions available.".into());
    }

    // exact language → prefix → non-asr → first
    let track = lang
        .as_deref()
        .and_then(|l| {
            tracks
                .iter()
                .find(|t| t.language_code.as_deref() == Some(l))
        })
        .or_else(|| {
            lang.as_deref().and_then(|l| {
                tracks
                    .iter()
                    .find(|t| t.language_code.as_deref().is_some_and(|c| c.starts_with(l)))
            })
        })
        .or_else(|| tracks.iter().find(|t| t.kind.as_deref() != Some("asr")))
        .or_else(|| tracks.first())
        .ok_or("No caption track matched.")?;

    // baseUrl already carries fmt=srv3; the server honours the first fmt, so
    // replace it rather than appending a second one.
    let mut url = reqwest::Url::parse(&track.base_url).map_err(|e| e.to_string())?;
    let mut pairs: Vec<(String, String)> = url.query_pairs().into_owned().collect();
    pairs.retain(|(key, _)| key != "fmt");
    pairs.push(("fmt".into(), "json3".into()));
    url.query_pairs_mut().clear().extend_pairs(pairs);

    let json3: serde_json::Value = client
        .get(url)
        .header(reqwest::header::USER_AGENT, ANDROID_UA)
        .send()
        .await
        .map_err(|e| format!("caption request failed: {e}"))?
        .error_for_status()
        .map_err(|e| format!("caption request failed: {e}"))?
        .json()
        .await
        .map_err(|e| format!("caption parse failed: {e}"))?;

    let language = track.language_code.clone();
    let other_languages = tracks
        .iter()
        .filter_map(|t| t.language_code.clone())
        .filter(|code| Some(code) != language.as_ref())
        .collect::<std::collections::BTreeSet<_>>()
        .into_iter()
        .collect();

    Ok(CaptionData {
        language,
        title: player
            .pointer("/videoDetails/title")
            .and_then(|v| v.as_str())
            .map(String::from),
        length_seconds: player
            .pointer("/videoDetails/lengthSeconds")
            .and_then(|v| v.as_str())
            .and_then(|s| s.parse().ok()),
        other_languages,
        json3,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    monitor_agent::configure(tauri::Builder::default())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            monitor_agent::setup(app)?;
            Ok(())
        })
        .on_window_event(monitor_agent::on_window_event)
        .invoke_handler(tauri::generate_handler![
            get_env_var,
            allow_folder,
            fetch_youtube_captions,
            monitor_agent::capture_screens,
            monitor_agent::screen_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
