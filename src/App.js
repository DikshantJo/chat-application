import React,{useState,useRef} from 'react';
import './App.css'


import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';


import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore'


// Your web app's Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyDXL6sDqoIIVfUEDZNtMPHmVgD8bvp0mvI",
  authDomain: "chat-appii.firebaseapp.com",
  projectId: "chat-appii",
  storageBucket: "chat-appii.appspot.com",
  messagingSenderId: "271985675656",
  appId: "1:271985675656:web:37ff1d478ae6d6fa4c7e3d"
})

const auth = firebase.auth();
const firestore = firebase.firestore();





function App() {
  const [user] = useAuthState(auth);
  // console.log(user)
  return (
    <div className="App">
      <header>
       <h1>Chat app</h1>
       <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}


function SignIn() {
  const SignInWithGoogle = () => {

    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  }
  
  return (
    <>
    <button className="sign-in" onClick = {()=>{SignInWithGoogle()}}>Sign in with Google</button>
    </>
  )
}


function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={()=> auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const scrollTo = useRef();

  const messagesRef = firestore.collection('messages');


  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query,{idField: 'id'});

  const [formValue,setFormValue] = useState('');



  const sendMessage = async (e) => {
    e.preventDefault();
    const {uid,photoURL} = auth.currentUser;

    await messagesRef.add({
      text:formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    scrollTo.current.scrollIntoView( {behavior: 'smooth'} );
    alert('scrolled')
  }
  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    </main>

    <span ref={scrollTo}></span>


    <form onSubmit = {sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='Message'/>
      <button type="submit">Send</button>
    </form>
    </>
  )
}



function ChatMessage(props) {
  
  const {text,uid,photoURL} = props.message;

  const messageClass = (uid === auth.currentUser.uid ? 'sent' : 'recieved');

  return (
    <>
    <div className={`message  ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
    </>
  )
}


export default App;
