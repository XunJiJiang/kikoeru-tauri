// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn open_new_window(app: tauri::AppHandle, label: String, url: String) {
    use tauri::WebviewUrl;
    let url = WebviewUrl::App(url.into());
    tauri::WebviewWindowBuilder::new(&app, label, url)
        .title("kikoeru")
        .inner_size(800.0, 600.0)
        .min_inner_size(450.0, 256.0)
        .build()
        .expect("failed to build window");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_new_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
