export interface WorkflowStep {
  /** Id of a built-in or saved prompt. */
  promptId: string
  /** Optional context for this step, shown above the prompt. */
  note?: string
}

/** An ordered sequence of prompts for a multi-step task. */
export interface Workflow {
  /** kebab-case, unique; used in the `#/workflows/<id>` route */
  id: string
  title: string
  description: string
  steps: WorkflowStep[]
}
