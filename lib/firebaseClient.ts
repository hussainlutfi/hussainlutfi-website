"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// إعدادات تطبيق الويب العامة (ليست سرّية) — تُستخدم لتسجيل الدخول بحساب Google فقط.
const config = {
  apiKey: "AIzaSyAHkgeMBIDCURZ4nJjFUDOyB8WnD0D4ItU",
  authDomain: "general-usage-39b8f.firebaseapp.com",
  projectId: "general-usage-39b8f",
  appId: "1:979609051983:web:27b62914b98f96cd0cdb3a",
};

export const clientAuth = () => getAuth(getApps().length ? getApp() : initializeApp(config));
