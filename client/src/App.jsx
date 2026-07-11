import { useEffect, useState } from "react";

function App() {

  const [get, setGet] = useState("");
  const [post, setPost] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => setGet(data.message));
  }, []);

  useEffect(() => {

    fetch("http://localhost:8000/", {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({name:'Ammar'}) 
    })
      .then((res) => res.json())
      .then((data) => setPost(data.message));


  }, [])


  return (
    <>
      <h1>{get}</h1>
      <h1>{post}</h1>
    </>
  )
}

export default App
