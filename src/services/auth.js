// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
//   signOut,
// } from "firebase/auth";
// import { auth } from "../config/firebase";

// export const authService = {
//   register: async (email, password) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       return userCredential.user;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   },

//   login: async (email, password) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       return userCredential.user;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   },

//   forgotPassword: async (email) => {
//     try {
//       await sendPasswordResetEmail(auth, email);
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   },

//   logout: async () => {
//     try {
//       await signOut(auth);
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   },
// };
