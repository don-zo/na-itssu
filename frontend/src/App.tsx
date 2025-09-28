import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { RouterPath } from "@/routes";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={RouterPath} />
    </QueryClientProvider>
  );
}

export default App;
