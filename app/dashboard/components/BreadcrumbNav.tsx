"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import axios from "axios";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
};

export default function BreadcrumbNav({
  folderId,
}: Readonly<{
  folderId?: string;
}>) {
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      if (!folderId) {
        setBreadcrumbs([]);
        return;
      }

      try {
        const response = await axios.get(`/api/folders/${folderId}/breadcrumbs`);

        setBreadcrumbs(response.data);
      } catch (error) {
        console.error("Error fetching breadcrumbs:", error);
      }
    };

    fetchBreadcrumbs();
  }, [folderId]);

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" /> My Drive
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((folder) => (
          <div key={folder.id} className="flex items-center">
            <BreadcrumbSeparator className="mr-1">
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/${folder.id}`}>{folder.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
