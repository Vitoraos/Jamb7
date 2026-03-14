import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#0F111A] min-h-screen text-[#E6E6E6] font-sans flex flex-col items-center p-4">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
}
