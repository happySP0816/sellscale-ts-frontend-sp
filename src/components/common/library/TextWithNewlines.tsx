import DOMPurify from "dompurify";

export default function TextWithNewline(props: { children: React.ReactNode, style: any }) {
  return (
    <div
      style={props.style}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize((props.children as string).replace('\n', '<br/>')),
      }}
    />
  );
}
