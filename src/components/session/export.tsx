import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const ExportButton = () => {
  // const handleExportSession = () => {
  //   if (activeId) {
  //     const jsonData = exportSession(activeId);
  //     if (jsonData) {
  //       downloadFile(jsonData, `session_${activeId}.json`, "application/json");
  //       toast.success("Session exported successfully");
  //     }
  //   }
  // };

  return (
    <div className="flex gap-2 p-2 border-t">
      <Button size="sm" variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export Session
      </Button>
    </div>
  );
};

// function downloadFile(content: string, fileName: string, contentType: string) {
//   const blob = new Blob([content], { type: contentType });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = fileName;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// }
