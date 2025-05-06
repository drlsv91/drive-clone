"use client";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import BreadcrumbNav from "../components/BreadcrumbNav";
import { showError } from "@/lib/utils";

const TrashHeader = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const emptyTrash = async () => {
    try {
      setIsLoading(true);
      await axios.delete("/api/trash/empty");
      toast.success("Trash emptied", {
        description: "All items in trash have been permanently deleted.",
      });
      router.refresh();
    } catch (error: unknown) {
      showError(error, "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <BreadcrumbNav />
        <div className="flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold">Trash</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
          onClick={emptyTrash}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Empty Trash</span>
          <Spinner show={isLoading} />
        </Button>
      </div>
    </div>
  );
};

export default TrashHeader;
