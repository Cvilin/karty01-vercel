import { AdminAuthWrapper } from "@/components/admin-auth-wrapper"
import { AdminPanel } from "@/components/admin/admin-panel"

export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <AdminPanel />
    </AdminAuthWrapper>
  )
}
