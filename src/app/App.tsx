import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { AuthProvider } from "@/features/user/auth/AuthProvider";
import { GitEngineProvider } from "@/features/git/GitEngineProvider";

export function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <GitEngineProvider>
            <RouterProvider router={router} />
          </GitEngineProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
