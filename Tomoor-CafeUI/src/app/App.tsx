import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/auth/AuthProvider"
import { RequestProvider } from "@/shared/request/RequestProvider"
import { router } from "./router"

function App() {
  return (
    <RequestProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </RequestProvider>
  )
}

export default App
