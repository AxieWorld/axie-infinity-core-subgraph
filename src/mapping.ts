import { Transfer } from '../generated/axie-core/AxieCore'
import { User, HoldersDataTotal, HoldersDataDay } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// To do some distinction for marketplace?
// const ADDRESS_MARKETPLACE = '0xf4985070ce32b6b1994329df787d1acc9a2dd9e2'

function createUser(id: string): User {
  let user = new User(id);
  user.axieCount = 0
  return user
}

function createHoldersDataTotal(): HoldersDataTotal {
  let holdersDataTotal = new HoldersDataTotal('singleton')
  holdersDataTotal.usersCount = 0
  holdersDataTotal.pastUsersCount = 0

  return holdersDataTotal
}

export function handleTransfer(event: Transfer): void {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let newUsers = 0;
  let newPastUsers = 0;

  // create total TokenData
  let holdersDataTotal = HoldersDataTotal.load('singleton')
  if (holdersDataTotal == null) {
    holdersDataTotal = createHoldersDataTotal()
  }

  // create daily TokenData
  let holdersDataDay = HoldersDataDay.load(dayStartTimestamp.toString())
  if (holdersDataDay == null) {
    holdersDataDay = new HoldersDataDay(dayStartTimestamp.toString())
    holdersDataDay.date = dayStartTimestamp
    holdersDataDay.newUsers = 0
    holdersDataDay.newPastUsers = 0
    holdersDataDay.usersCount = 0
    holdersDataDay.pastUsersCount = 0
  }

  // handle user from, ignore 0x
  if (event.params._from.toHexString() != ADDRESS_ZERO) {
    let userFrom = User.load(event.params._from.toHex())
    
    if (userFrom == null) {
      userFrom = createUser(event.params._from.toHex())
      newUsers = newUsers + 1
      newPastUsers = newPastUsers + 1
    }

    userFrom.axieCount = userFrom.axieCount - 1

    if (userFrom.axieCount == 0) {
      newUsers = newUsers - 1
    }

    userFrom.save()
  }

  // handle user to, ignore 0x
  if (event.params._to.toHexString() != ADDRESS_ZERO) {
    let userTo = User.load(event.params._to.toHex())

    if (userTo == null) {
      userTo = createUser(event.params._to.toHex())
      newUsers = newUsers + 1
      newPastUsers = newPastUsers + 1
    }

    userTo.axieCount = userTo.axieCount +1

    userTo.save()
  }

  // save and accumulate HoldersData

  // log.warning('data day {} {}', [BigInt.fromI32(holdersDataDay.newUsers).toString(), BigInt.fromI32(holdersDataDay.newPastUsers).toString()])
  
  holdersDataDay.newUsers = holdersDataDay.newUsers + newUsers
  holdersDataDay.newPastUsers = holdersDataDay.newPastUsers + newPastUsers
  holdersDataDay.usersCount = holdersDataTotal.usersCount + newUsers
  holdersDataDay.pastUsersCount = holdersDataTotal.pastUsersCount + newPastUsers
  holdersDataDay.save()
  
  holdersDataTotal.usersCount = holdersDataTotal.usersCount + newUsers
  holdersDataTotal.pastUsersCount = holdersDataTotal.pastUsersCount + newPastUsers
  holdersDataTotal.save()

  // log.warning('data total {} {}', [BigInt.fromI32(holdersDataTotal.usersCount).toString(), BigInt.fromI32(holdersDataTotal.pastUsersCount).toString()])
}
