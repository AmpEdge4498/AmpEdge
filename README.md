# AmpEdge On-Demand Services Platform
*The ₹1000 Cr Vision for India's Electrical Services.*

## Architecture
- **Backend:** Node.js, Express, MongoDB
- **Mobile App:** React Native (Expo), NativeWind, React Navigation, Maps, Razorpay.
- **Admin Dashboard:** React.js (Vite), TailwindCSS, Axios.

---

## 🚀 1. Running the Backend Server
```bash
cd backend
npm install
npm run dev
# Server boots on http://localhost:5000
```
*(Requires MongoDB running on `mongodb://127.0.0.1:27017/ampedge_db`)*

---

## 📱 2. Generating the Android APK (Mobile App)

We used Expo so that building an APK is completely seamless via EAS (Expo Application Services).

### Prerequisites:
1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```
2. Login to your Expo developer account:
```bash
eas login
```

### Build Instructions:
1. Navigate to the mobile app:
```bash
cd mobile-app
```
2. Configure EAS (if not done automatically already):
```bash
eas build:configure
```
3. To build a shareable **testing APK** (instead of an AAB for the PlayStore):
Edit `eas.json` to include:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```
4. Run the build command:
```bash
eas build -p android --profile preview
```
5. **Download the APK!** Expo will provide a URL to download your successfully compiled Android app containing Razorpay and Maps Native SDKs.

### Local Development:
```bash
npm start
# Press 'a' to open in Android Emulator
```

---

## 💻 3. Running the Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
# Dashboard available at http://localhost:5173
```
*(Login using any valid string to safely bypass mock admin validation during staging)*.

---

## 🔐 Missing Credentials Checklist (.env files):
- `backend/.env`: Firebase Service Account JSON Path, MongoDB URI, test Razorpay Keys.
- `mobile-app/app.json`: Google Maps API Key must be injected to render the maps.
