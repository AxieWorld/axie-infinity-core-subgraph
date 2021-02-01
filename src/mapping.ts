import { Transfer } from '../generated/axie-core/AxieCore'
import { User, HoldersDataTotal, HoldersDataDay } from '../generated/schema'

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

function createHoldersDataDay(dayStartTimestamp: number, usersCount: number, pastUsersCount: number): HoldersDataDay {
  let holdersDataDay = new HoldersDataDay(dayStartTimestamp.toString())
  holdersDataDay.date = dayStartTimestamp as i32
  holdersDataDay.newUsers = 0
  holdersDataDay.usersCount = usersCount as i32
  holdersDataDay.pastUsersCount = pastUsersCount as i32

  return holdersDataDay
}

export function handleTransfer(event: Transfer): void {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400

  // create total TokenData
  let holdersDataTotal = HoldersDataTotal.load('singleton')
  if (holdersDataTotal == null) {
    holdersDataTotal = createHoldersDataTotal()
  }

  // create daily TokenData
  let holdersDataDay = HoldersDataDay.load(dayStartTimestamp.toString())
  if (holdersDataDay == null) {
    holdersDataDay = createHoldersDataDay(dayStartTimestamp, holdersDataTotal.usersCount, holdersDataTotal.pastUsersCount)
  }

  // handle user from, ignore 0x
  if (event.params._from.toHexString() != ADDRESS_ZERO) {
    let userFrom = User.load(event.params._from.toHex())
    
    if (userFrom == null) {
      userFrom = createUser(event.params._from.toHex())
      holdersDataDay.newUsers = holdersDataDay.newUsers + 1
      holdersDataDay.usersCount = holdersDataDay.usersCount + 1
      holdersDataDay.pastUsersCount = holdersDataDay.pastUsersCount + 1
    }

    userFrom.axieCount = userFrom.axieCount - 1

    if (userFrom.axieCount == 0) {
      holdersDataDay.usersCount = holdersDataDay.usersCount - 1
    }

    userFrom.save()
  }

  // handle user to, ignore 0x
  if (event.params._to.toHexString() != ADDRESS_ZERO) {
    let userTo = User.load(event.params._to.toHex())

    if (userTo == null) {
      userTo = createUser(event.params._to.toHex())
      holdersDataDay.newUsers = holdersDataDay.newUsers + 1
      holdersDataDay.usersCount = holdersDataDay.usersCount + 1
      holdersDataDay.usersCount = holdersDataDay.usersCount + 1
    }

    userTo.axieCount = userTo.axieCount + 1

    userTo.save()
  }

  // save and accumulate HoldersData
  holdersDataDay.save()

  holdersDataTotal.usersCount = holdersDataTotal.usersCount + holdersDataDay.usersCount 
  holdersDataTotal.pastUsersCount = holdersDataTotal.pastUsersCount + holdersDataDay.pastUsersCount
  holdersDataTotal.save()
}
