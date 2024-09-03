import DOMPurify from "dompurify";

export default function TextWithNewline(props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  breakheight?: string;
}) {
  return (
    <div
      className={props.className}
      style={props.style}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(
          (`${props.children}` || "").replaceAll(
            "\n",
            `<br style="display: block; content: ' '; margin: ${
              props.breakheight || 0
            } 0; margin-bottom: 4px; "/>`
          )
        ),
      }}
    />
  );
}
