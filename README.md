# 📝 Todo & Notes Manager (Desktop App)

O aplicație nativă de desktop rapidă, ușoară și sigură pentru gestionarea task-urilor și a notițelor complexe. Construită cu **Tauri** și **Rust** pentru performanță maximă, având o amprentă de memorie extrem de mică (un instalator de sub 10MB).

Interfața este creată special pentru productivitate, inspirată din designul documentațiilor de cod (ex: Godot Engine), permițând formatarea notițelor direct din tastatură.

## ✨ Funcționalități

- 🗂️ **Sistem Ierarhic:** Organizează-ți viața pe Categorii -> Todos -> Carduri de detalii (Pași/Notițe).
- 🎨 **Code-Style Highlighting:** Formatează textul rapid folosind semne speciale (ex: \`text\` pentru albastru, ~text~ pentru roșu, @text@ pentru verde, ^text^ pentru galben).
- 💾 **Stocare Nativă Sigură:** Datele sunt salvate automat direct în `AppData` pe sistemul tău de operare, ferite de ștergeri accidentale.
- 🛡️ **Protecție la Ștergere:** Confirmare "2-step" printr-un modal intuitiv pentru orice acțiune ireversibilă.
- ⚡ **Performanță Nativă:** Fără servere Node.js sau browsere greoaie în fundal. Totul rulează printr-un bridge securizat IPC (Inter-Process Communication) către backend-ul de Rust.
- 🌙 **Dark Theme UI:** Interfață elegantă, responsive, construită cu HTML, CSS și Vanilla JS.

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3, Phosphor Icons
- **Backend / Core:** Rust, Tauri (v2)
- **Package Manager:** npm

---

## 🚀 Cum să rulezi proiectul local (Development)

Pentru a contribui sau a modifica codul sursă, ai nevoie de **Node.js** și **Rust** instalate pe sistemul tău.

2. Pornirea aplicației în modul Dev
Acest script va porni sistemul de hot-reloading și va compila automat codul Rust:

Bash
```
npm run tauri dev
```
📦 Cum să compilezi aplicația (.exe)
Dacă vrei să generezi fișierul .exe pentru Windows, gata de instalat, rulează comanda:

Bash
```
npm run tauri build
```
Odată terminat procesul de build (poate dura câteva minute prima dată, deoarece Rust optimizează codul), vei găsi instalatorul aplicației în:
src-tauri/target/release/bundle/
