use lettre::message::{Attachment, header::ContentType, MultiPart};
use lettre::{Message, SmtpTransport, Transport};
use tauri::Manager;
use std::fs;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn send_email_backup(
    app: tauri::AppHandle,
    host: String,
    port: u16,
    username: String,
    password: String,
    to_email: String,
) -> Result<(), String> {
    let db_path = app.path().app_data_dir().unwrap().join("mechanicpro.db");
    let db_data = fs::read(&db_path).map_err(|e| format!("Failed to read database: {}", e))?;
    let attachment = Attachment::new(String::from("mechanicpro_backup.db")).body(db_data, ContentType::parse("application/octet-stream").unwrap());
    
    let email = Message::builder()
        .from(username.parse().map_err(|_| "Invalid username email format")?)
        .to(to_email.parse().map_err(|_| "Invalid to_email format")?)
        .subject("MechanicPro Database Backup")
        .multipart(
            MultiPart::mixed()
                .singlepart(
                    lettre::message::SinglePart::plain(String::from("Attached is your monthly MechanicPro database backup."))
                )
                .singlepart(attachment)
        )
        .map_err(|e| format!("Failed to build email: {}", e))?;
        
    let creds = lettre::transport::smtp::authentication::Credentials::new(username, password);
    let mailer = SmtpTransport::relay(&host)
        .map_err(|e| format!("Invalid SMTP host: {}", e))?
        .port(port)
        .credentials(creds)
        .build();
        
    tauri::async_runtime::spawn_blocking(move || {
        mailer.send(&email).map_err(|e| format!("Failed to send email: {}", e))
    }).await.map_err(|_| "Thread panicked".to_string())??;
    
    Ok(())
}

#[tauri::command]
fn backup_local_db(app: tauri::AppHandle, target_dir: String, filename: String) -> Result<(), String> {
    let db_path = app.path().app_data_dir().unwrap().join("mechanicpro.db");
    let target_path = std::path::Path::new(&target_dir).join(&filename);
    
    std::fs::copy(&db_path, &target_path).map_err(|e| format!("Failed to copy database: {}", e))?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, send_email_backup, backup_local_db])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
