// Notion API type definitions
export type AnyNotionProperty = 
  | NotionTitleProperty 
  | NotionRichTextProperty 
  | NotionDateProperty 
  | NotionSelectProperty 
  | NotionCheckboxProperty
  | NotionMultiSelectProperty
  | NotionProperty;

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, AnyNotionProperty>;
  url: string;
}

export interface NotionProperty {
  id: string;
  type: string;
}

export interface NotionTitleProperty extends NotionProperty {
  type: 'title';
  title: Array<{
    plain_text: string;
    href?: string;
  }>;
}

export interface NotionRichTextProperty extends NotionProperty {
  type: 'rich_text';
  rich_text: Array<{
    plain_text: string;
    href?: string;
  }>;
}

export interface NotionDateProperty extends NotionProperty {
  type: 'date';
  date: {
    start: string;
    end?: string;
  } | null;
}

export interface NotionSelectProperty extends NotionProperty {
  type: 'select';
  select: {
    name: string;
    color: string;
  } | null;
}

export interface NotionMultiSelectProperty extends NotionProperty {
  type: 'multi_select';
  multi_select: Array<{
    name: string;
    color: string;
  }>;
}

export interface NotionCheckboxProperty extends NotionProperty {
  type: 'checkbox';
  checkbox: boolean;
}

export interface NotionResponse<T = NotionPage> {
  object: string;
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
}