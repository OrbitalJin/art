//! Read-only search commands for connected folders.
//!
//! All walking/matching is delegated to ripgrep's own libraries (`ignore`,
//! `globset`, `grep-searcher`, `grep-regex`) so `.gitignore`, binary detection,
//! encoding and line numbers behave exactly like `rg`. Every command refuses to
//! touch a root that is not a granted folder in the fs scope.

use std::io;
use std::path::{Path, PathBuf};

use globset::{GlobBuilder, GlobSet, GlobSetBuilder};
use grep_regex::RegexMatcherBuilder;
use grep_searcher::{BinaryDetection, Searcher, SearcherBuilder, Sink, SinkMatch};
use ignore::WalkBuilder;
use serde::Serialize;
use tauri_plugin_fs::FsExt;

const DEFAULT_LIMIT: usize = 200;
const MAX_LIMIT: usize = 1000;
const MAX_LINE_LEN: usize = 500;
const MAX_FILE_SIZE: u64 = 1_000_000;
const DEFAULT_DEPTH: usize = 3;
const MAX_DEPTH: usize = 12;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileHit {
    pub path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GrepHit {
    pub path: String,
    pub line: u64,
    pub text: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TreeEntry {
    pub path: String,
    pub is_dir: bool,
    pub depth: usize,
}

/// Canonicalize a requested root and confirm it sits inside a granted folder.
fn canonical_root(app: &tauri::AppHandle, root: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(root);

    if !path.is_dir() {
        return Err(format!("Not a directory: {}", path.display()));
    }

    if !app.fs_scope().is_allowed(&path) {
        return Err(format!(
            "Access denied: {} is not a connected folder.",
            path.display()
        ));
    }

    let canonical = std::fs::canonicalize(&path)
        .map_err(|e| format!("Cannot resolve \"{}\": {e}", path.display()))?;

    Ok(crate::strip_verbatim(canonical))
}

fn clamp_limit(limit: Option<usize>) -> usize {
    limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT)
}

/// Forward-slash path relative to `root` (empty for the root itself).
fn rel_path(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

fn build_glob(pattern: &str) -> Result<GlobSet, String> {
    let glob = GlobBuilder::new(pattern)
        .case_insensitive(cfg!(windows))
        .build()
        .map_err(|e| format!("Invalid glob \"{pattern}\": {e}"))?;

    let mut builder = GlobSetBuilder::new();
    builder.add(glob);
    builder.build().map_err(|e| e.to_string())
}

/// A `.gitignore`-aware, hidden-skipping walker rooted at `root`.
fn walker(root: &Path) -> WalkBuilder {
    let mut builder = WalkBuilder::new(root);
    builder
        .hidden(true)
        .git_ignore(true)
        .git_exclude(true)
        .git_global(false)
        .follow_links(false);
    builder
}

#[tauri::command]
pub fn search_files(
    app: tauri::AppHandle,
    root: String,
    glob: Option<String>,
    limit: Option<usize>,
) -> Result<Vec<FileHit>, String> {
    let root = canonical_root(&app, &root)?;
    let limit = clamp_limit(limit);
    let matcher = glob.as_deref().map(build_glob).transpose()?;

    let mut hits = Vec::new();

    for entry in walker(&root).build() {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        if entry.depth() == 0 {
            continue;
        }

        if !entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
            continue;
        }

        let rel = rel_path(&root, entry.path());

        if let Some(set) = &matcher {
            if !set.is_match(&rel) {
                continue;
            }
        }

        hits.push(FileHit { path: rel });

        if hits.len() >= limit {
            break;
        }
    }

    Ok(hits)
}

#[tauri::command]
pub fn list_tree(
    app: tauri::AppHandle,
    root: String,
    depth: Option<usize>,
    limit: Option<usize>,
) -> Result<Vec<TreeEntry>, String> {
    let root = canonical_root(&app, &root)?;
    let limit = clamp_limit(limit);
    let max_depth = depth.unwrap_or(DEFAULT_DEPTH).clamp(1, MAX_DEPTH);

    let mut builder = walker(&root);
    builder.max_depth(Some(max_depth));

    let mut entries = Vec::new();

    for entry in builder.build() {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        if entry.depth() == 0 {
            continue;
        }

        entries.push(TreeEntry {
            path: rel_path(&root, entry.path()),
            is_dir: entry.file_type().map(|t| t.is_dir()).unwrap_or(false),
            depth: entry.depth(),
        });

        if entries.len() >= limit {
            break;
        }
    }

    Ok(entries)
}

/// Collects matches for one file at a time; the caller sets `path` before each
/// `search_path`.
struct MatchSink {
    path: String,
    hits: Vec<GrepHit>,
    limit: usize,
}

impl Sink for MatchSink {
    type Error = io::Error;

    fn matched(&mut self, _searcher: &Searcher, mat: &SinkMatch<'_>) -> Result<bool, io::Error> {
        if self.hits.len() >= self.limit {
            return Ok(false);
        }

        let text = String::from_utf8_lossy(mat.bytes());
        let text = text.trim_end_matches(['\n', '\r']);

        self.hits.push(GrepHit {
            path: self.path.clone(),
            line: mat.line_number().unwrap_or(0),
            text: truncate_chars(text, MAX_LINE_LEN),
        });

        Ok(true)
    }

    /// Stop searching this file as soon as binary content is detected.
    fn binary_data(
        &mut self,
        _searcher: &Searcher,
        _binary_byte_offset: u64,
    ) -> Result<bool, io::Error> {
        Ok(false)
    }
}

fn truncate_chars(text: &str, max: usize) -> String {
    if text.chars().count() <= max {
        return text.to_string();
    }

    let mut truncated: String = text.chars().take(max).collect();
    truncated.push('…');
    truncated
}

#[tauri::command]
pub fn grep_files(
    app: tauri::AppHandle,
    root: String,
    pattern: String,
    glob: Option<String>,
    case_sensitive: Option<bool>,
    limit: Option<usize>,
) -> Result<Vec<GrepHit>, String> {
    if pattern.is_empty() {
        return Err("Pattern must not be empty.".into());
    }

    let root = canonical_root(&app, &root)?;
    let limit = clamp_limit(limit);
    let globs = glob.as_deref().map(build_glob).transpose()?;

    let matcher = RegexMatcherBuilder::new()
        .case_insensitive(!case_sensitive.unwrap_or(true))
        .build(&pattern)
        .map_err(|e| format!("Invalid pattern: {e}"))?;

    let mut searcher = SearcherBuilder::new()
        .line_number(true)
        .binary_detection(BinaryDetection::quit(0))
        .build();

    let mut sink = MatchSink {
        path: String::new(),
        hits: Vec::new(),
        limit,
    };

    for entry in walker(&root).build() {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        if !entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
            continue;
        }

        // Skip files over the size cap rather than letting the searcher read them.
        if entry.metadata().map(|m| m.len()).unwrap_or(0) > MAX_FILE_SIZE {
            continue;
        }

        let rel = rel_path(&root, entry.path());

        if let Some(set) = &globs {
            if !set.is_match(&rel) {
                continue;
            }
        }

        sink.path = rel;

        // Permission errors and unreadable files are skipped, not fatal.
        let _ = searcher.search_path(&matcher, entry.path(), &mut sink);

        if sink.hits.len() >= limit {
            break;
        }
    }

    Ok(sink.hits)
}
