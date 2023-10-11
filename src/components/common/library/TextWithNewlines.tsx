import DOMPurify from "dompurify";

export default function TextWithNewline(props: { children: React.ReactNode, style?: any, className?: string, breakheight?: string }) {
  return (
    <div
      className={props.className}
      style={props.style}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize((props.children as string)?.replaceAll('\n', `<br style="display: block; content: ' '; margin: ${props.breakheight || 0} 0 "/>`)),
      }}
    />
  );
}
