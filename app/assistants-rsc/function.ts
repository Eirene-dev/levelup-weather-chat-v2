export interface Email {
  id: string;
  subject: string;
  date: string;
  has_attachments: boolean;
}

export function searchEmails({
  query,
  has_attachments,
}: {
  query: string;
  has_attachments: boolean;
}): Email[] {
  // Return some fake emails based on the query and has_attachments
  return [
    {
      id: '1',
      subject: `Re: ${query}`,
      date: '2024-06-11',
      has_attachments: has_attachments,
    },
    {
      id: '2',
      subject: `${query} - Important`,
      date: '2024-06-10',
      has_attachments: !has_attachments,
    },
  ];
}