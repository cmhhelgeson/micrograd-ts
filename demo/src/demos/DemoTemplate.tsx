import { ParagraphMedium } from "baseui/typography";
import { CodeLinks } from "../components/code-links";
import { H2 } from "../components/h2";

interface DemoTemplateProps {
  text: string;
  codeLinks: {name: string, url: string}[]
}

export const DemoTemplate: React.FC<React.PropsWithChildren<DemoTemplateProps>> = ({text, codeLinks, children}) => {
  return (
    <>
      <ParagraphMedium>
        {text}
      </ParagraphMedium>

      <H2>Code Context</H2>
      <CodeLinks
        links={codeLinks}
      />
      {children}
    </>
  );
}