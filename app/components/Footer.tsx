"use client";

import { Box, Container, Typography, IconButton } from "@mui/material";
import { LinkedIn as LinkedInIcon } from "@mui/icons-material";
import XIcon from "@mui/icons-material/X";
import Image from "next/image";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: { md: "flex-start", xs: "center" },
          }}
        >
          {/* Logo */}
          <Image
            src="/icons/name-dicoration.png"
            alt="حسين الزاير"
            width={120}
            height={60}
            style={{ objectFit: "contain" }}
          />

          {/* Text Content */}
          <Box
            sx={{
              textAlign: { xs: "center", md: "right" },
              maxWidth: "400px",
              direction: "rtl",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#6b7280",
                fontFamily: "Tajawal",
                fontWeight: 500,
                lineHeight: 1.6,
                mb: 2,
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              الموقع الرسمي لمهندس البرمجيات حسين الزاير فيها بياناته الخاصة
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#9ca3af",
                fontFamily: "Tajawal",
                fontWeight: 500,
                lineHeight: 1.6,
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              جميع الحقوق محفوظة لمهندس البرمجيات حسين الزاير © ٢٠٢٥
            </Typography>
          </Box>

          {/* Social Media Icons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <IconButton
              href="https://x.com/hussainlutfi"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "#6b7280",
                "&:hover": {
                  color: "#16b1a1",
                  backgroundColor: "rgba(22, 177, 161, 0.1)",
                },
              }}
            >
              <XIcon />
            </IconButton>
            <IconButton
              href="https://linkedin.com/in/hussainlutfi"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "#6b7280",
                "&:hover": {
                  color: "#16b1a1",
                  backgroundColor: "rgba(22, 177, 161, 0.1)",
                },
              }}
            >
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
