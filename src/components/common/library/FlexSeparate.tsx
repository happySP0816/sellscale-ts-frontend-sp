
export default function FlexSeparate({ children, noWrap, alignItems }: { children: React.ReactNode, noWrap?: boolean, alignItems?: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      flexWrap: noWrap || noWrap === undefined ? 'nowrap' : 'wrap',
      alignItems: alignItems,
    }}>
      {children}
    </div>
  );
}
