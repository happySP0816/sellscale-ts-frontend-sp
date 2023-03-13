
export default function FlexSeparate({ children, noWrap }: { children: React.ReactNode, noWrap?: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      flexWrap: noWrap || noWrap === undefined ? 'nowrap' : 'wrap',
    }}>
      {children}
    </div>
  );
}
