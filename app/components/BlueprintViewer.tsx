"use client";

type BlueprintViewerProps = {
  /** The blueprintUE.com blueprint ID (from the URL: blueprintue.com/blueprint/XXXX) */
  id: string;
  /** Height of the viewer */
  height?: string;
};

export default function BlueprintViewer({ id, height = "500px" }: BlueprintViewerProps) {
  return (
    <div className="my-4 rounded-lg border-2 border-black dark:border-[#00AFC7] overflow-hidden shadow-[4px_4px_0_0_#00AFC7] dark:shadow-[4px_4px_0_0_#00AFC7]">
      {/* Embedded blueprint viewer */}
      <iframe
        src={`https://blueprintue.com/render/${id}/`}
        width="100%"
        height={height}
        scrolling="no"
        allowFullScreen
        style={{ border: "none", display: "block", background: "#1e1e1e" }}
        loading="lazy"
      />
    </div>
  );
}