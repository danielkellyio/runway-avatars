export type generatedAvatar = {
  id: string;
  status:
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED"
    | "PENDING"
    | "RUNNING"
    | "THROTTLED";
  createdAt: string | Date;
  output?: string[];
};
