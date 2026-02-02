import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pages from "./pages/index.jsx"

import { Toaster } from "./components/ui/toaster"


function App() {
  return (
    <>
      
         <Pages />
      <Toaster /> 
    

    </>
  )
}

export default App ;