import { Transfer } from '../generated/SLP/SLP'
import { Transfer as TransferRecord } from '../generated/schema'

export function handleTransfer(event: Transfer): void {
  let transfer = new TransferRecord(event.transaction.hash.toHex())
  transfer.transactionHash = event.transaction.hash

  transfer.value = event.params._value
  transfer.from = event.params._from
  transfer.to = event.params._to

  transfer.blockNumber = event.block.number
  transfer.timestamp = event.block.timestamp

  transfer.save()
}
