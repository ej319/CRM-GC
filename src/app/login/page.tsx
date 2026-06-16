import { LoginCard } from "@/components/login-card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">CRM</h1>
          <p className="text-sm text-muted-foreground">G+C Facility GmbH</p>
        </div>
        <LoginCard />
      </div>
    </main>
  );
}
