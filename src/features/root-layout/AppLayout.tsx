import { Box } from "@mui/material";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
      }}
    >
      {/* <Header /> */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      {/* <Footer /> */}
    </Box>
  );
};
