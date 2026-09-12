export type PropType = "string" | "number" | "boolean" | "union" | "unknown";

export interface PropContract {
  name: string;
  required: boolean;
  type: PropType;
  values?: string[];
}

export interface ComponentContract {
  name: string;
  filePath: string;
  props: PropContract[];
}
