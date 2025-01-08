"use client";

import { useState } from "react";
import PDFPreview from "@/components/pages/pdf/pdf-preview";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setIsPreviewOpen(true)}>Open PDF Preview</Button>

      <PDFPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
