import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/auth/AuthProvider"
import { RequestProvider } from "@/shared/request/RequestProvider"
import { FeedbackProvider } from "@/shared/feedback/FeedbackProvider"
import { router } from "./router"

function App() {
  return (
    <FeedbackProvider><RequestProvider><AuthProvider><RouterProvider router={router} /></AuthProvider></RequestProvider></FeedbackProvider>
  )
}

export default App
