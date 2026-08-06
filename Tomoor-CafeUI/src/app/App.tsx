import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/auth/AuthProvider"
import { FeedbackProvider } from "@/shared/feedback/FeedbackProvider"
import {
  queryClient,
  queryPersistOptions,
} from "@/shared/query/queryClient"
import { RequestProvider } from "@/shared/request/RequestProvider"
import { router } from "./router"

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={queryPersistOptions}
    >
      <FeedbackProvider>
        <RequestProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </RequestProvider>
      </FeedbackProvider>
    </PersistQueryClientProvider>
  )
}

export default App
