import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase/FirebaseConfig";
import { showToast } from "../utils/toast";

// Auth context oluşturma
const AuthContext = createContext(null);

/**
 * Kimlik doğrulama provider bileşeni
 * Kullanıcı oturum durumunu ve ilgili işlevleri yönetir
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = FIREBASE_AUTH;

  // Kullanıcı oturum durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı oturum açmış durumda
        try {
          // Firestore'dan ek kullanıcı bilgilerini al
          const userDoc = await getDoc(
            doc(FIRESTORE_DB, "users", firebaseUser.uid)
          );

          if (userDoc.exists()) {
            // Firestore ve Firebase Auth verilerini birleştir
            const userData = {
              ...firebaseUser,
              ...userDoc.data(),
            };
            setUser(userData);
            // Kullanıcı bilgilerini önbelleğe kaydet
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          } else {
            // Kullanıcı Firestore'da yok, sadece Firebase Auth verilerini kullan
            setUser(firebaseUser);
            await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
          }
        } catch (error) {
          console.error("User data loading error:", error);
          setUser(firebaseUser);
        }
      } else {
        // Kullanıcı oturum açmamış durumda
        setUser(null);
        await AsyncStorage.removeItem("user");
      }
      setLoading(false);
    });

    // Cleanup: Listener'ı kaldır
    return () => unsubscribe();
  }, []);

  /**
   * Yeni bir kullanıcı kaydı oluşturur
   * @param {string} email - Kullanıcı e-posta adresi
   * @param {string} password - Kullanıcı şifresi
   * @param {string} displayName - Kullanıcı görünen adı
   * @returns {Promise<Object>} - Oluşturulan kullanıcı nesnesi
   */
  const register = async (email, password, displayName) => {
    try {
      setLoading(true);

      // Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Kullanıcı profilini güncelle
      await updateProfile(newUser, { displayName });

      // Kullanıcıyı Firestore'a kaydet
      await setDoc(doc(FIRESTORE_DB, "users", newUser.uid), {
        uid: newUser.uid,
        email,
        displayName,
        createdAt: serverTimestamp(),
        tokens: 5, // Yeni kullanıcı için 5 token hediye
        freeTrialUsed: false,
      });

      showToast("success", "Account created successfully");
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";

      // Firebase hata kodlarını işle
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }

      showToast("error", errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Kullanıcı girişi yapar
   * @param {string} email - Kullanıcı e-posta adresi
   * @param {string} password - Kullanıcı şifresi
   * @returns {Promise<Object>} - Giriş yapan kullanıcı nesnesi
   */
  const login = async (email, password) => {
    try {
      setLoading(true);

      // Firebase Auth ile giriş yap
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      showToast("success", "Logged in successfully");
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";

      // Firebase hata kodlarını işle
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Try again later";
      }

      showToast("error", errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Kullanıcı çıkışı yapar
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      showToast("success", "Logged out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      showToast("error", "Failed to log out");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Şifre sıfırlama e-postası gönderir
   * @param {string} email - Kullanıcı e-posta adresi
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      showToast("success", "Password reset email sent");
    } catch (error) {
      console.error("Password reset error:", error);
      showToast("error", "Failed to send reset email");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        signOut,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Kimlik doğrulama context'i hook'unu dışa aktar
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
