import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB_GLPCNmLZfK9uhIks5RWAeR0u2dplT98",
  authDomain: "momollie.firebaseapp.com",
  projectId: "momollie",
  storageBucket: "momollie.firebasestorage.app",
  messagingSenderId: "81641915996",
  appId: "1:81641915996:web:ca9376063d31aeb5824899",
  measurementId: "G-57ZWT23PHW",
};

// Lazily initialized — avoids calling Firebase APIs at module load time
let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;
let _functions: Functions | undefined;

function app(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    getAnalytics(_app);
  }
  return _app;
}

export function db(): Firestore {
  if (!_db) _db = getFirestore(app());
  return _db;
}

export function auth(): Auth {
  if (!_auth) _auth = getAuth(app());
  return _auth;
}

export function storage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(app());
  return _storage;
}

export function functions(): Functions {
  if (!_functions) _functions = getFunctions(app());
  return _functions;
}
