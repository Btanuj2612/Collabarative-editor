import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5000");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");

  // CAMERA STATES
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("Exit");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // CAMERA LOGIC
  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setCameraStream(stream);
          const video = document.getElementById("cameraVideo");
          video.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera Error:", err);
          setShowCamera(false);
        });
    }
  }, [showCamera]);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const Exit = () => {
    socket.emit("Exit");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <button onClick={copyRoomId} className="copy-button">
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.slice(0, 8)}</li>
          ))}
        </ul>
        <p className="typing-indicator">{typing}</p>

        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <button className="leave-button" onClick={Exit}>
          Exit
        </button>

        {/* CAMERA BUTTON */}
        <button 
          className="camera-btn"
          onClick={() => setShowCamera(true)}
        >
          Open Camera
        </button>
      </div>

      <div className="editor-wrapper">
        <Editor
          height={"60%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
        <button className="run-btn" onClick={runCode}>Run</button>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output will appear here..."
        ></textarea>
      </div>

      {/* FLOATING CAMERA BOX */}
      {showCamera && (
        <div className="camera-box">
          <video id="cameraVideo" autoPlay playsInline></video>

          <button
            className="close-cam-btn"
            onClick={() => {
              if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
              setShowCamera(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default App;














// import { useEffect, useState } from "react";
// import "./App.css";
// import io from "socket.io-client";
// import Editor from "@monaco-editor/react";

// const socket = io("http://localhost:5000");

// const App = () => {
//   const [joined, setJoined] = useState(false);
//   const [roomId, setRoomId] = useState("");
//   const [userName, setUserName] = useState("");
//   const [language, setLanguage] = useState("javascript");
//   const [code, setCode] = useState("// start code here");
//   const [copySuccess, setCopySuccess] = useState("");
//   const [users, setUsers] = useState([]);
//   const [typing, setTyping] = useState("");
//   const [outPut, setOutPut] = useState("");
//   const [version, setVersion] = useState("*");
//   useEffect(() => {
//     socket.on("userJoined", (users) => {
//       setUsers(users);
//     });

//     socket.on("codeUpdate", (newCode) => {
//       setCode(newCode);
//     });

//     socket.on("userTyping", (user) => {
//       setTyping(`${user.slice(0, 8)}... is Typing`);
//       setTimeout(() => setTyping(""), 2000);
//     });

//     socket.on("languageUpdate", (newLanguage) => {
//       setLanguage(newLanguage);
//     });

//     socket.on("codeResponse",(response)=>{
//       setOutPut(response.run.output)
//     })

//     return () => {
//       socket.off("userJoined");
//       socket.off("codeUpdate");
//       socket.off("userTyping");
//       socket.off("languageUpdate");
//       socket.off("codeResponse")
//     };
//   }, []);

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       socket.emit("Exit");
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);

//   const joinRoom = () => {
//     if (roomId && userName) {
//       socket.emit("join", { roomId, userName });
//       setJoined(true);
//     }
//   };

//   const Exit = () => {
//     socket.emit("Exit");
//     setJoined(false);
//     setRoomId("");
//     setUserName("");
//     setCode("// start code here");
//     setLanguage("javascript");
//   };

//   const copyRoomId = () => {
//     navigator.clipboard.writeText(roomId);
//     setCopySuccess("Copied!");
//     setTimeout(() => setCopySuccess(""), 2000);
//   };

//   const handleCodeChange = (newCode) => {
//     setCode(newCode);
//     socket.emit("codeChange", { roomId, code: newCode });
//     socket.emit("typing", { roomId, userName });
//   };

//   const handleLanguageChange = (e) => {
//     const newLanguage = e.target.value;
//     setLanguage(newLanguage);
//     socket.emit("languageChange", { roomId, language: newLanguage });
//   };

//   const runCode=()=>{
//     socket.emit("compileCode",{code,roomId,language,version})
//   }

//   if (!joined) {
//     return (
//       <div className="join-container">
//         <div className="join-form">
//           <h1>Join Code Room</h1>
//           <input
//             type="text"
//             placeholder="Room Id"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Your Name"
//             value={userName}
//             onChange={(e) => setUserName(e.target.value)}
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="editor-container">
//       <div className="sidebar">
//         <div className="room-info">
//           <h2>Code Room: {roomId}</h2>
//           <button onClick={copyRoomId} className="copy-button">
//             Copy Id
//           </button>
//           {copySuccess && <span className="copy-success">{copySuccess}</span>}
//         </div>
//         <h3>Users in Room:</h3>
//         <ul>
//           {users.map((user, index) => (
//             <li key={index}>{user.slice(0, 8)}</li>
//           ))}
//         </ul>
//         <p className="typing-indicator">{typing}</p>
//         <select
//           className="language-selector"
//           value={language}
//           onChange={handleLanguageChange}
//         >
//           <option value="javascript">JavaScript</option>
//           <option value="python">Python</option>
//           <option value="java">Java</option>
//           <option value="cpp">C++</option>
//         </select>
//         <button className="leave-button" onClick={Exit}>
//           Exit
//         </button>
//       </div>

//       <div className="editor-wrapper">
//         <Editor
//           height={"60%"}
//           defaultLanguage={language}
//           language={language}
//           value={code}
//           onChange={handleCodeChange}
//           theme="vs-dark"
//           options={{
//             minimap: { enabled: false },
//             fontSize: 14,
//           }}
//         />
//         <button className="run-btn" onClick={runCode}>Run</button>
//         <textarea className="output-console"value={outPut} readOnly placeholder="Output will appear here..."></textarea>
//       </div>
//     </div>
//   );
// };

// export default App;

// import { useState } from "react";
// import "./App.css";
// import io from "socket.io-client";
// import Editor from '@monaco-editor/react'

// const socket = io("http://localhost:5000");

// const App = () => {
//   const [joined, setJoined] = useState(false);
//   const [roomId, setRoomId] = useState("");
//   const [userName, setUserName] = useState("");
//   const [language,setLanguage]=useState("javascript");
//   const [code,setCode]=useState("")

//   const joinRoom = () => {
//     if (roomId && userName) {
//       socket.emit("join", { roomId, userName }); // ✅ fixed variable name
//       setJoined(true);
//     } else {
//       alert("Please enter both Room ID and Name");
//     }
//   };

//   const copyRoomId = () => {};

//   const handleCodeChange=(newCode)=>{
//     setCode(newCode)
//   }
//   if (!joined) {
//     return (
//       <div className="join-container">
//         <div className="join-form">
//           <h1>Join Code Room</h1>
//           <input
//             type="text"
//             placeholder="Room Id"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Your Name"
//             value={userName}
//             onChange={(e) => setUserName(e.target.value)}
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="editor-container">
//       <div className="sidebar">
//         <div className="room-info">
//           <h2>Code Room:{roomId}</h2>
//           <button onclick={copyRoomId} className="cpu-button">Copy Id</button>
//         </div>
//         <h3>User in Room:</h3>
//         <ul>
//           <li>Tanuj</li>
//           <li>Xyz</li>
//         </ul>
//         <p className="typing-indicator">user typing ...........</p>
//         <select className="language-selector">
//           <option value="javascript">JavaScript</option>
//           <option value="python">Python</option>
//           <option value="java">Java</option>
//           <option value="c++">C++</option>
//         </select>
//         <button className="leave-button">Exit</button>
//       </div>
//       <div className="editor-wrapper">
//         <Editor
//         height={"100%"}
//         defaultLanguage={language}
//         language={language}
//         value={code}
//         onChange={handleCodeChange}
//         theme="vs-dark"
//         options={
//           {
//             minimap:{enabled:false},
//             fontSize:14,
//           }
//         }

//         />
//       </div>
//     </div>
//   );
// };

// export default App;
