// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::Manager; // Importăm sistemul de management Tauri pentru a găsi folderele oficiale din Windows

// Comanda pentru a citi datele
#[tauri::command]
fn load_data(app: tauri::AppHandle) -> Result<String, String> {
    // 1. Obținem calea oficială și sigură pentru datele aplicației (ex: AppData/Roaming pe Windows)
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    
    // 2. Dacă folderul aplicației nu există încă, îl creăm
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    }

    // 3. Calea finală va fi: AppData/.../data.json
    let file_path = app_dir.join("data.json");

    if file_path.exists() {
        println!("[INFO] Citesc datele din: {:?}", file_path);
        fs::read_to_string(file_path).map_err(|err| err.to_string())
    } else {
        println!("[INFO] Generez data.json nou în: {:?}", file_path);
        let default_data = r#"{"categories": []}"#;
        fs::write(file_path, default_data).unwrap_or_default();
        Ok(default_data.to_string())
    }
}

// Comanda pentru a salva datele
#[tauri::command]
fn save_data(app: tauri::AppHandle, payload: String) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    }

    let file_path = app_dir.join("data.json");
    fs::write(file_path, payload).map_err(|err| err.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_data, save_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}