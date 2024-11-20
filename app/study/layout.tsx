import React from "react";

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
