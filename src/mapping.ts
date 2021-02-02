import { Transfer } from '../generated/axie-core/AxieCore'
import { User, HoldersDataTotal, HoldersDataDay } from '../generated/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// To do some distinction for marketplace?
// const ADDRESS_MARKETPLACE = '0xf4985070ce32b6b1994329df787d1acc9a2dd9e2'

function createUser(id: string): User {
  let user = new User(id);
  user.axieCount = BigInt.fromI32(0)
  return user
}

function createHoldersDataTotal(): HoldersDataTotal {
  let holdersDataTotal = new HoldersDataTotal('singleton')
  holdersDataTotal.usersCount = BigInt.fromI32(0)
  holdersDataTotal.pastUsersCount = BigInt.fromI32(0)

  return holdersDataTotal
}

export function handleTransfer(event: Transfer): void {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400

  // create total TokenData
  let holdersDataTotal = HoldersDataTotal.load('singleton')
  if (holdersDataTotal == null) {
    log.warning('create new total', [])
    holdersDataTotal = createHoldersDataTotal()
    log.warning('finish new total', [])
  }

  // create daily TokenData
  let holdersDataDay = HoldersDataDay.load(dayStartTimestamp.toString())
  if (holdersDataDay == null) {
    let holdersDataDay = new HoldersDataDay(dayStartTimestamp.toString())
    log.warning('create new date', [])
    holdersDataDay.date = dayStartTimestamp
    holdersDataDay.newUsers = BigInt.fromI32(0)
    holdersDataDay.usersCount = holdersDataTotal.usersCount
    holdersDataDay.pastUsersCount = holdersDataTotal.pastUsersCount
    log.warning('finish new date', [])
  }

  // log date
  log.warning('hey date, {}', [holdersDataDay.id.toString()])
  log.warning('hey users, {}', [holdersDataDay.usersCount.toString()])
  log.warning('hey past users, {}', [holdersDataDay.pastUsersCount.toString()])
  log.warning('hey new users, {}', [holdersDataDay.newUsers.toString()])

  // handle user from, ignore 0x
  if (event.params._from.toHexString() != ADDRESS_ZERO) {
    let userFrom = User.load(event.params._from.toHex())
    
    if (userFrom == null) {
      userFrom = createUser(event.params._from.toHex())
      holdersDataDay.newUsers = holdersDataDay.newUsers.plus(BigInt.fromI32(1))
      holdersDataDay.usersCount = holdersDataDay.usersCount.plus(BigInt.fromI32(1))
      holdersDataDay.pastUsersCount = holdersDataDay.pastUsersCount.plus(BigInt.fromI32(1))
    }

    userFrom.axieCount = userFrom.axieCount.minus(BigInt.fromI32(1))

    if (userFrom.axieCount.equals(BigInt.fromI32(0))) {
      holdersDataDay.usersCount = holdersDataDay.usersCount.minus(BigInt.fromI32(1))
    }

    userFrom.save()
  }

  // handle user to, ignore 0x
  if (event.params._to.toHexString() != ADDRESS_ZERO) {
    let userTo = User.load(event.params._to.toHex())

    if (userTo == null) {
      // log.warning('hey 1, {}', ['before create'])
      userTo = createUser(event.params._to.toHex())
      // log.warning('hey 1, {}', ['after create'])
      // log.warning('hey 1, {}', [holdersDataDay.id])
      holdersDataDay.newUsers = holdersDataDay.newUsers.plus(BigInt.fromI32(1))
      // log.warning('hey 1, {}', ['new create'])
      holdersDataDay.usersCount = holdersDataDay.usersCount.plus(BigInt.fromI32(1))
      holdersDataDay.usersCount = holdersDataDay.usersCount.plus(BigInt.fromI32(1))
    }

    userTo.axieCount = userTo.axieCount.plus(BigInt.fromI32(1))

    userTo.save()
  }

  log.warning('save, {} {}', [event.transactionLogIndex.toString(), event.params._to.toHex()])
  // save and accumulate HoldersData
  holdersDataDay.save()

  holdersDataTotal.usersCount = holdersDataTotal.usersCount.plus(holdersDataDay.usersCount)
  holdersDataTotal.pastUsersCount = holdersDataTotal.pastUsersCount.plus(holdersDataDay.pastUsersCount)
  holdersDataTotal.save()
}
