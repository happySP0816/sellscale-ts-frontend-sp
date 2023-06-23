import DOMPurify from "dompurify";

export default function TextWithNewline(props: { children: React.ReactNode, style?: any, className?: string }) {
  return (
    <div
      className={props.className}
      style={props.style}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize((props.children as string).replace('\n', '<br/>')),
      }}
    />
  );
}
