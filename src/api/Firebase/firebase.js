import app from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAgZbhcIqAQytjXGpjabMo-jX0IDltCjEI",
  authDomain: "example-project-629b4.firebaseapp.com",
  databaseURL: "https://example-project-629b4.firebaseio.com",
  projectId: "example-project-629b4",
  storageBucket: "example-project-629b4.appspot.com",
  messagingSenderId: "255061287813",
  appId: "1:255061287813:web:22f839a84f16ef39779aec",
  measurementId: "G-8B04ZZWJP1"
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    this.auth = app.auth();
    this.firestore = app.firestore();
    this.storage = app.storage();
    this.functions = app.functions();
  }
  
  
  // *** Sign In API ***

  signIn = (email, password) => this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () =>
    this.auth.signOut().then(() => localStorage.removeItem("authUser"));

  // *** Merge Auth and DB User API ***
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(async (snapshot) => {
            if (snapshot.exists) {
              const dbUser = snapshot.data();
              // eslint-disable-next-line no-prototype-builtins
              if (!dbUser.hasOwnProperty("roles")) {
                dbUser.roles = {
                  guest: true,
                };
                await this.user(authUser.uid).update(dbUser);
              }

              authUser = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                providerData: authUser.providerData,
                ...dbUser,
              };

              next(authUser);
            } else {
              const dbUser = {
                roles: {
                  guest: true,
                },
              };

              this.user(authUser.uid)
                .set(dbUser)
                .then(() => {
                  authUser = {
                    uid: authUser.uid,
                    email: authUser.email,
                    emailVerified: authUser.emailVerified,
                    providerData: authUser.providerData,
                    ...dbUser,
                  };

                  next(authUser);
                });
            }
          })
          .catch(console.error);
      } else {
        fallback();
      }
    });

  
  // *** Firestore API ***
  
  user = (uid) => this.firestore.doc(`users/${uid}`);
  users = () => this.firestore.collection("users");
  
  post = (uid) => this.firestore.doc(`posts/${uid}`);
  posts = () => this.firestore.collection("posts");
  
  config = (configName) => this.firestore.doc(`config/${configName}`);
  
  
  // *** Functions API ***

  callFun = (funName) => this.functions.httpsCallable(funName);
  
  // *** Storage API ***
  
  file = (folder, uid) => this.storage.child(`${folder}/${uid}`);
}

export default Firebase;