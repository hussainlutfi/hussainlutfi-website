"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { name: "الرئيسية", href: "/" },
    { name: "المشاريع", href: "/projects" },
    { name: "الخبرات", href: "/experience" },
    { name: "تواصل معي", href: "/contact" },
  ];

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        height: "100%",
        backgroundColor: "white",
        fontFamily: "Tajawal",
        direction: "rtl",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          p: 2,
        }}
      >
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <Link
              href={item.href}
              style={{ width: "100%", textDecoration: "none", justifyContent: "center", display: "flex" }}
            >
              <Button
                sx={{
                  color: "#374151",
                  fontFamily: "Tajawal",
                  fontWeight: 500,
                  fontSize: "1rem",
                  "&:hover": {
                    color: "#16b1a1",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {item.name}
              </Button>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "white",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          direction: "rtl",
        }}
      >
        <Toolbar sx={{ alignItems: "center", justifyContent: { xs:"space-between", md: "flex-start" }, gap: 2, px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Link href="/">
            <Image
              src="/icons/name-dicoration.png"
              alt="حسين الزاير"
              width={95}
              height={50}
              style={{ objectFit: "contain", cursor: "pointer" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <Button
                  sx={{
                    color: "#374151",
                    fontFamily: "Tajawal",
                    fontWeight: 500,
                    fontSize: "1rem",
                    "&:hover": {
                      color: "#16b1a1",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </Box>

          {/* Mobile menu button */}
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { md: "none" },
              color: "#374151",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            direction: "rtl",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
