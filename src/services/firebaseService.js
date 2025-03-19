import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { FIREBASE_APP } from "../../firebase/FirebaseConfig";

// Initialize Firebase services
const auth = getAuth(FIREBASE_APP);
const db = getFirestore(FIREBASE_APP);
const storage = getStorage(FIREBASE_APP);

/**
 * Firebase Service - A unified service for Firebase operations
 */
const firebaseService = {
  // ==============================
  // Authentication Service Methods
  // ==============================
  auth: {
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} displayName - User display name
     * @returns {Promise<Object>} User credentials
     */
    register: async (email, password, displayName) => {
      try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update profile
        await updateProfile(userCredential.user, { displayName });

        // Create user document in Firestore
        await firebaseService.firestore.setDoc(
          "users",
          userCredential.user.uid,
          {
            uid: userCredential.user.uid,
            email,
            displayName,
            createdAt: serverTimestamp(),
            tokens: 5, // Free tokens for new users
            freeTrialUsed: false,
          }
        );

        return userCredential;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },

    /**
     * Log in a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User credentials
     */
    login: async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        return userCredential;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    /**
     * Log out the current user
     * @returns {Promise<void>}
     */
    logout: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    resetPassword: async (email) => {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        console.error("Password reset error:", error);
        throw error;
      }
    },

    /**
     * Get the current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser: () => {
      return auth.currentUser;
    },
  },

  // ==============================
  // Firestore Service Methods
  // ==============================
  firestore: {
    /**
     * Add a document to a collection
     * @param {string} collectionName - Name of the collection
     * @param {Object} data - Document data
     * @returns {Promise<Object>} Document reference
     */
    addDoc: async (collectionName, data) => {
      try {
        return await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
      }
    },

    /**
     * Set a document with a specific ID
     * @param {string} collectionName - Name of the collection
     * @param {string} docId - Document ID
     * @param {Object} data - Document data
     * @returns {Promise<void>}
     */
    setDoc: async (collectionName, docId, data) => {
      try {
        const docRef = doc(db, collectionName, docId);
        return await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error setting document in ${collectionName}:`, error);
        throw error;
      }
    },

    /**
     * Get a document by ID
     * @param {string} collectionName - Name of the collection
     * @param {string} docId - Document ID
     * @returns {Promise<Object>} Document data
     */
    getDoc: async (collectionName, docId) => {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error("Document not found");
        }

        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error);
        throw error;
      }
    },

    /**
     * Query documents in a collection
     * @param {string} collectionName - Name of the collection
     * @param {Array} conditions - Array of query conditions [field, operator, value]
     * @param {string} orderByField - Field to order by
     * @param {string} orderDirection - Order direction ('asc' or 'desc')
     * @param {number} limitCount - Number of documents to return
     * @returns {Promise<Array>} Array of documents
     */
    queryDocs: async (
      collectionName,
      conditions = [],
      orderByField = null,
      orderDirection = "desc",
      limitCount = null
    ) => {
      try {
        let q = collection(db, collectionName);

        // Add query conditions
        if (conditions && conditions.length > 0) {
          conditions.forEach((condition) => {
            q = query(q, where(condition[0], condition[1], condition[2]));
          });
        }

        // Add order by
        if (orderByField) {
          q = query(q, orderBy(orderByField, orderDirection));
        }

        // Add limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error(
          `Error querying documents from ${collectionName}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Update a document
     * @param {string} collectionName - Name of the collection
     * @param {string} docId - Document ID
     * @param {Object} data - Document data to update
     * @returns {Promise<void>}
     */
    updateDoc: async (collectionName, docId, data) => {
      try {
        const docRef = doc(db, collectionName, docId);
        return await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating document in ${collectionName}:`, error);
        throw error;
      }
    },

    /**
     * Delete a document
     * @param {string} collectionName - Name of the collection
     * @param {string} docId - Document ID
     * @returns {Promise<void>}
     */
    deleteDoc: async (collectionName, docId) => {
      try {
        const docRef = doc(db, collectionName, docId);
        return await deleteDoc(docRef);
      } catch (error) {
        console.error(`Error deleting document from ${collectionName}:`, error);
        throw error;
      }
    },
  },

  // ==============================
  // Storage Service Methods
  // ==============================
  storage: {
    /**
     * Upload a file to Firebase Storage
     * @param {File|Blob} file - File to upload
     * @param {string} path - Storage path
     * @param {function} onProgress - Progress callback (optional)
     * @returns {Promise<Object>} Upload result with download URL
     */
    uploadFile: async (file, path, onProgress = () => {}) => {
      try {
        // Create storage reference
        const storageRef = ref(storage, path);

        // Start upload
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Return a promise that resolves when upload completes
        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Progress updates
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              // Error handling
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              // Upload completed successfully
              try {
                // Get download URL
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );

                // Return success result
                resolve({
                  downloadURL,
                  storagePath: path,
                  size: uploadTask.snapshot.totalBytes,
                  contentType: file.type || "application/octet-stream",
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } catch (error) {
        console.error("Storage upload error:", error);
        throw error;
      }
    },

    /**
     * Delete a file from Firebase Storage
     * @param {string} path - Storage path
     * @returns {Promise<void>}
     */
    deleteFile: async (path) => {
      try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
      } catch (error) {
        console.error("Storage delete error:", error);
        throw error;
      }
    },

    /**
     * Get download URL for a file
     * @param {string} path - Storage path
     * @returns {Promise<string>} Download URL
     */
    getDownloadURL: async (path) => {
      try {
        const storageRef = ref(storage, path);
        return await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Get download URL error:", error);
        throw error;
      }
    },
  },
};

export default firebaseService;
