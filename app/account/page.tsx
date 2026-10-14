import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = {
  title: "บัญชีของฉัน & ตั้งค่าการแจ้งเตือน | TreeForLife",
  description: "จัดการบัญชีและการแจ้งเตือนดูแลต้นไม้ผ่าน LINE และ Web Push",
};

export default function AccountPage() {
  return <AccountClient />;
}
