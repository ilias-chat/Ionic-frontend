export const environment = {
  production: true,
  /** Cloud Run base URL only — no path, no trailing slash. Confirm project number in Google Cloud Console if requests fail. */
  apiBaseUrl: 'https://ic844-node-backend-367467645438.europe-west1.run.app',
  firebase: {
    apiKey: "AIzaSyA_AoaaVgqPiNh4Bt8tR7dKPLTD8ThQt1g",
    authDomain: "ic844-football-app.firebaseapp.com",
    projectId: "ic844-football-app",
    storageBucket: "ic844-football-app.firebasestorage.app",
    messagingSenderId: "693733784260",
    appId: "1:693733784260:web:9ea483a1d315e4cd112791",
    measurementId: "G-BY8S2Y4S19"
  }
};
