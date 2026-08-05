import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { AuthProvider } from "@/features/user/auth/AuthProvider";

export function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
