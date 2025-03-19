import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  // İlave importlar:
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
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

  // Uygulama başladığında, AsyncStorage'dan kullanıcı bilgilerini kontrol et ve yeniden giriş yap
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Eğer zaten Firebase'de authenticate edilmiş kullanıcı varsa, işlem yapma
        if (auth.currentUser) {
          return;
        }

        // E-posta ve şifre bilgilerini kontrol et (güvenli saklama için EncryptedStorage kullanmanız önerilir)
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedPassword = await AsyncStorage.getItem("userPassword"); // Önerilen: EncryptedStorage

        if (storedEmail && storedPassword) {
          try {
            // Firebase ile yeniden giriş yap
            const userCredential = await signInWithEmailAndPassword(
              auth,
              storedEmail,
              storedPassword
            );
            console.log("Auto login successful");
          } catch (loginError) {
            console.error("Auto login failed:", loginError);
            // Hata durumunda verileri temizle
            await AsyncStorage.removeItem("userEmail");
            await AsyncStorage.removeItem("userPassword");
            await AsyncStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      }
    };

    initAuth();
  }, []);

  // Firebase auth listener'ı
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Kullanıcı oturum açmış durumda
          // E-posta ve token bilgisini sakla (sonraki otomatik girişler için)
          await AsyncStorage.setItem("userEmail", firebaseUser.email);
          // Not: Gerçek bir token saklamak için, Firebase'in idToken veya refreshToken özelliklerini kullanabilirsiniz
          // Bu örnek için basit bir değer kullanıyoruz
          await AsyncStorage.setItem("userLoginToken", firebaseUser.uid);

          const userDoc = await getDoc(
            doc(FIRESTORE_DB, "users", firebaseUser.uid)
          );

          if (userDoc.exists()) {
            const userData = {
              ...firebaseUser,
              ...userDoc.data(),
            };
            setUser(userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          } else {
            setUser(firebaseUser);
            await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
          }
        } else {
          // Eğer Firebase kullanıcı yok diyorsa, AsyncStorage'daki bilgiyi de temizle
          setUser(null);
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("userEmail");
          await AsyncStorage.removeItem("userLoginToken");
        }
      } catch (error) {
        console.error("User state change error:", error);
      } finally {
        setLoading(false);
      }
    });

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

      // E-posta ve token bilgisini sakla (otomatik giriş için)
      await AsyncStorage.setItem("userEmail", email);
      await AsyncStorage.setItem("userLoginToken", newUser.uid);

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

      // Otomatik giriş için bilgileri sakla
      await AsyncStorage.setItem("userEmail", email);
      // NOT: Şifreleri saklamak güvenlik açısından ideal değildir
      // Daha iyi bir çözüm için React Native Keychain veya EncryptedStorage gibi
      // güvenli depolama çözümlerini kullanmanız önerilir
      await AsyncStorage.setItem("userPassword", password);

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
      // AsyncStorage'dan kullanıcı bilgilerini temizle
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userEmail");
      await AsyncStorage.removeItem("userPassword");

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

  /**
   * Kullanıcı profilini günceller
   * @param {string} displayName - Yeni görünen ad
   * @param {string} email - Yeni e-posta adresi
   * @returns {Promise<void>}
   */
  const updateUserProfile = async (displayName, email) => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Firebase Auth'ta displayName güncelleme
      await updateProfile(currentUser, { displayName });

      // E-posta değiştiyse güncelle
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
        // Yeni e-postayı AsyncStorage'a kaydet
        await AsyncStorage.setItem("userEmail", email);
      }

      // Firestore'daki kullanıcı verisini güncelle
      await updateDoc(doc(FIRESTORE_DB, "users", currentUser.uid), {
        displayName,
        email,
        updatedAt: serverTimestamp(),
      });

      // Güncel kullanıcı bilgisini al
      const userDoc = await getDoc(doc(FIRESTORE_DB, "users", currentUser.uid));

      if (userDoc.exists()) {
        const updatedUserData = {
          ...currentUser,
          ...userDoc.data(),
        };
        setUser(updatedUserData);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));
      }

      showToast("success", "Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);

      let errorMessage = "Failed to update profile";

      // Hata kodlarını kontrol et
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please sign in again to update your profile";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use";
      }

      showToast("error", errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Kullanıcı şifresini değiştirir
   * @param {string} currentPassword - Mevcut şifre
   * @param {string} newPassword - Yeni şifre
   * @returns {Promise<void>}
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Mevcut kimlik bilgileriyle yeniden kimlik doğrulama (güvenlik için)
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Şifreyi güncelle
      await updatePassword(currentUser, newPassword);

      showToast("success", "Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);

      let errorMessage = "Failed to change password";

      // Hata kodlarını kontrol et
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please sign in again to change your password";
      }

      showToast("error", errorMessage);
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
        changePassword,
        updateUserProfile,
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
