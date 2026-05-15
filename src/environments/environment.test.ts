/**
 * Used only for `ng test --configuration=ci` (see angular.json fileReplacements).
 * Valid Firebase web shape; tests do not call the live API.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:9',
  firebase: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:000000000000000000000',
  },
};
