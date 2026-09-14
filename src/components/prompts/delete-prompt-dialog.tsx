import { useId } from 'react'
import type { UserPrompt } from '../../types/prompt'
import { Button } from '../ui/button'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'

interface DeletePromptDialogProps {
  prompt: UserPrompt
  onConfirm: () => void
  onCancel: () => void
}

/** Mount only while a delete is pending. */
export function DeletePromptDialog({ prompt, onConfirm, onCancel }: DeletePromptDialogProps) {
  const titleId = useId()

  return (
    <Modal open onClose={onCancel} labelledBy={titleId} className="w-[min(28rem,calc(100vw-2rem))]">
      <ModalHeader
        titleId={titleId}
        title="Delete saved prompt?"
        description={`"${prompt.title}" will be removed from this browser. This can't be undone.`}
        onClose={onCancel}
      />
      <ModalFooter className="justify-end">
        <Button onClick={onCancel} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  )
}
