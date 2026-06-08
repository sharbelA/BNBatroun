"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function HostCreatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast.success("Host account created");
      router.replace("/admin/hosts");
    }
  }, [searchParams, router]);

  return null;
}
