'use client';

import { StreamableValue, useStreamableValue } from 'ai/rsc';
import { useEffect, useState } from 'react';

import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (text) {
      // Markdown을 HTML로 변환
      remark()
        .use(remarkGfm)
        .use(html)
        .process(text)
        .then(processedText => {
          setHtmlContent(processedText.toString());
        })
        .catch(error => {
          console.error('Error processing markdown:', error);
        });
    }
  }, [text]);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
