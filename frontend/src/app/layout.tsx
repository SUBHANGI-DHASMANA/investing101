import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/theme/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Box, Container } from "@mui/material";



export const metadata: Metadata = {
  title: "Investing101 - Learn Investing with Virtual Money",
  description: "A platform to learn investing with virtual money and real market data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Navbar />
              <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }} maxWidth="lg">
                {children}
              </Container>
              <Footer />
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
