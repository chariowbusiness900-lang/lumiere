#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{fs, path::PathBuf};
#[tauri::command]
fn list_audio_files(folder: String) -> Vec<String> {
    let mut out = Vec::new();
    fn walk(dir: PathBuf, out: &mut Vec<String>) {
        if let Ok(entries) = fs::read_dir(&dir) {
            for e in entries.flatten() {
                let p = e.path();
                if p.is_dir() { walk(p, out); }
                else if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
                    if ["mp3","flac","m4a","ogg","wav"].contains(&ext.to_lowercase().as_str()) { out.push(p.to_string_lossy().to_string()); }
                }
            }
        }
    }
    walk(PathBuf::from(folder), &mut out);
    out
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![list_audio_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
