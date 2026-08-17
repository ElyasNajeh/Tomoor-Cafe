import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { FeedbackProvider } from "@/shared/feedback/FeedbackProvider"
import { queryClient } from "@/shared/query/queryClient"
import { RequestProvider } from "@/shared/request/RequestProvider"
import { I18nProvider } from "@/localization/I18nProvider"
import { router } from "./router"

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <FeedbackProvider>
          <RequestProvider>
            <RouterProvider router={router} />
          </RequestProvider>
        </FeedbackProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}

export default App
