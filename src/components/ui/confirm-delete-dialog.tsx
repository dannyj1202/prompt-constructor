import { useId } from 'react'
import { Button } from './button'
import { Modal, ModalFooter, ModalHeader } from './modal'

interface ConfirmDeleteDialogProps {
  /** What's being deleted, e.g. "saved prompt" or "workflow". */
  noun: string
  itemTitle: string
  onConfirm: () => void
  onCancel: () => void
}

/** Mount only while a delete is pending. */
export function ConfirmDeleteDialog({ noun, itemTitle, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  const titleId = useId()

  return (
    <Modal open onClose={onCancel} labelledBy={titleId} className="w-[min(28rem,calc(100vw-2rem))]">
      <ModalHeader
        titleId={titleId}
        title={`Delete ${noun}?`}
        description={`"${itemTitle}" and its edit history will be permanently deleted. This can't be undone.`}
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
