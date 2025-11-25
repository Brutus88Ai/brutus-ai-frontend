import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

let firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
} catch (error) {
  console.error('Firebase config parse error:', error);
}

let app, auth, db;
if (firebaseConfig?.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase init error:', error);
  }
}

export { auth, db };

// Firebase functions
export const firebaseFunctions = {
  async getPrompts() {
    if (!db) return [];
    try {
      const querySnapshot = await getDocs(collection(db, 'prompts'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting prompts:', error);
      return [];
    }
  },

  async addPrompt(prompt) {
    if (!db) throw new Error('Firebase not initialized');
    const docRef = await addDoc(collection(db, 'prompts'), {
      ...prompt,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, ...prompt };
  },

  async updatePromptStatus(id, status) {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'prompts', id), { status });
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  },

  async deletePrompt(id) {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'prompts', id));
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  },

  async getVideos() {
    if (!db) return [];
    try {
      const querySnapshot = await getDocs(collection(db, 'videos'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  },

  async addVideo(video) {
    if (!db) throw new Error('Firebase not initialized');
    const docRef = await addDoc(collection(db, 'videos'), {
      ...video,
      publishedAt: serverTimestamp()
    });
    return { id: docRef.id, ...video };
  }
};