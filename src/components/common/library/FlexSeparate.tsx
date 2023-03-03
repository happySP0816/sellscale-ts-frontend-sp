
export default function FlexSeparate({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {children}
    </div>
  );
}
