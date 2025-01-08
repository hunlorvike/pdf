"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { jsPDF } from "jspdf";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import React from "react";

interface PDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFPreview({ isOpen, onClose }: PDFPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Load font
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: "NotoSansJP";
        src: url("/fonts/NotoSansJP-Regular.ttf");
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    // Pre-load images
    const imageUrls = Array.from(
      { length: 8 },
      (_, i) => `https://v0.dev/placeholder.svg?text=Image${i + 1}`
    );
    Promise.all(
      imageUrls.map((url) =>
        fetch(url)
          .then((response) => response.blob())
          .then(
            (blob) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          )
      )
    ).then((base64Images) => setImages(base64Images as string[]));

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);
    try {
      // First render to canvas with high quality settings
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 794, // A4 width in pixels
        windowHeight: 1123, // A4 height in pixels
      });

      // Initialize PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const width = pageWidth;
      const height = pageWidth / ratio;

      // Add image to PDF with proper scaling
      let heightLeft = height;
      let position = 0;

      // First page
      pdf.addImage(imgData, "JPEG", 0, position, width, height);
      heightLeft -= pageHeight;

      // Add new pages if content exceeds first page
      while (heightLeft >= 0) {
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, width, height);
        heightLeft -= pageHeight;
      }

      pdf.save("report.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-xl font-semibold">Inspection Report Preview</h2>
          <Button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? "Generating..." : "Export PDF"}
          </Button>
        </div>

        <section className="w-[210mm] mx-auto border bg-white">
          <div
            ref={contentRef}
            className="p-[5mm] font-[NotoSansJP] text-black text-sm"
            style={{
              minHeight: "297mm",
              backgroundColor: "white",
            }}
          >
            <table className="w-full border-collapse border-2 border-black">
              <thead className="text-center">
                <tr>
                  <th
                    rowSpan={2}
                    className="border-2 border-black p-2 min-w-[100px]"
                  >
                    部位
                  </th>
                  <th className="border-2 border-black p-2">番号</th>
                  <th colSpan={2} className="border-2 border-black p-2">
                    調査項目
                  </th>
                  <th className="border-2 border-black p-2">調査結果</th>
                </tr>
                <tr>
                  <td className="border-2 border-black p-2">
                    Hà Nội, Việt Nam
                  </td>
                  <td colSpan={2} className="border-2 border-black p-2">
                    72 Trần Đăng Ninh, Dịch Vọng, Cầu giấy
                  </td>
                  <td className="border-2 border-black p-2">
                    <div className="flex items-end justify-center space-x-2">
                      <div className="w-3 h-3 border border-black"></div>
                      <span className="flex items-center">要是正</span>
                      <div className="w-3 h-3 border border-black"></div>
                      <span className="flex items-center">経過観察</span>
                      <div className="w-3 h-3 border border-black"></div>
                      <span className="flex items-center">その他</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black p-2">特記事項</td>
                  <td colSpan={2} className="border-2 border-black p-2">
                    <span>要是正</span>
                  </td>
                  <td colSpan={2} className="border-2 border-black p-2">
                    <span>経過観察</span>
                  </td>
                </tr>
              </thead>
            </table>

            <table className="w-full border-collapse border-2 border-black mt-0">
              <tbody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td colSpan={4} className="border-2 border-black p-2">
                        common description
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border-2 border-black p-2">
                        <img
                          src={images[index * 2]}
                          alt={`赤外線画像No.2257-${index * 2}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "300px",
                            objectFit: "contain",
                          }}
                        />
                        <div className="mt-2">original description</div>
                      </td>
                      <td colSpan={2} className="border-2 border-black p-2">
                        <img
                          src={images[index * 2 + 1]}
                          alt={`赤外線画像No.2257-${index * 2 + 1}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "300px",
                            objectFit: "contain",
                          }}
                        />
                        <div className="mt-2">original description</div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
