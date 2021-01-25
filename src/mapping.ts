import { Transfer } from '../generated/SLP/SLP'
import { User, TokenDataTotal, TokenDataDay } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

function createUser(id: string): User {
  let user = new User(id);
  user.balance = BigInt.fromI32(0)
  user.minted = BigInt.fromI32(0)
  user.burned = BigInt.fromI32(0)
  user.transactionCount = 0
  return user
}

export function handleTransfer(event: Transfer): void {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400

  // create total TokenData
  let tokenDataTotal = TokenDataTotal.load('singleton')
  if (tokenDataTotal == null) {
    tokenDataTotal = new TokenDataTotal('singleton')
    tokenDataTotal.supply = BigInt.fromI32(0)
    tokenDataTotal.minted = BigInt.fromI32(0)
    tokenDataTotal.burned = BigInt.fromI32(0)
    tokenDataTotal.usersCount = 0
  }

  // create daily TokenData
  let tokenDataDay = TokenDataDay.load(dayStartTimestamp.toString())
  if (tokenDataDay == null) {
    tokenDataDay = new TokenDataDay(dayStartTimestamp.toString())
    tokenDataDay.supply = BigInt.fromI32(0)
    tokenDataDay.minted = BigInt.fromI32(0)
    tokenDataDay.burned = BigInt.fromI32(0)
    tokenDataDay.date = dayStartTimestamp
  }

  if (event.params._from.toHexString() == ADDRESS_ZERO) {
    tokenDataDay.supply = tokenDataDay.supply + event.params._value
    tokenDataDay.minted = tokenDataDay.minted + event.params._value
  }

  if (event.params._to.toHexString() == ADDRESS_ZERO) {
    tokenDataDay.supply = tokenDataDay.supply - event.params._value
    tokenDataDay.burned = tokenDataDay.burned + event.params._value
  }

  // handle user from, ignore 0x
  if (event.params._from.toHexString() != ADDRESS_ZERO) {

    let userFrom = User.load(event.params._from.toHex())
    
    if (userFrom == null) {
      userFrom = createUser(event.params._from.toHex())
      tokenDataTotal.usersCount = tokenDataTotal.usersCount + 1
    }

    userFrom.balance = userFrom.balance - event.params._value
    userFrom.transactionCount = userFrom.transactionCount + 1

    // check if SLP was burned
    if (event.params._to.toHexString() == ADDRESS_ZERO) {
      userFrom.burned = userFrom.burned + event.params._value
    }

    userFrom.save()
  }


  // handle user from, ignore 0x
  if (event.params._to.toHexString() != ADDRESS_ZERO) {

    let userTo = User.load(event.params._to.toHex())
    if (userTo == null) {
      userTo = createUser(event.params._to.toHex())
      tokenDataTotal.usersCount = tokenDataTotal.usersCount + 1
    }

    userTo.balance = userTo.balance + event.params._value
    userTo.transactionCount = userTo.transactionCount + 1
    
    // check if SLP was minted
    if (event.params._from.toHexString() == ADDRESS_ZERO) {
      userTo.minted = userTo.minted + event.params._value
    }
    
    userTo.save()
  }

  // save and accumulate TokenData
  tokenDataDay.save()

  tokenDataTotal.supply = tokenDataTotal.supply + tokenDataDay.supply 
  tokenDataTotal.minted = tokenDataTotal.minted + tokenDataDay.minted
  tokenDataTotal.burned = tokenDataTotal.burned + tokenDataDay.burned
  tokenDataTotal.save()
}
