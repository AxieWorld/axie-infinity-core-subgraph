// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save User entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save User entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("User", id.toString(), this);
  }

  static load(id: string): User | null {
    return store.get("User", id) as User | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get axieCount(): i32 {
    let value = this.get("axieCount");
    return value.toI32();
  }

  set axieCount(value: i32) {
    this.set("axieCount", Value.fromI32(value));
  }
}

export class HoldersDataTotal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save HoldersDataTotal entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save HoldersDataTotal entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("HoldersDataTotal", id.toString(), this);
  }

  static load(id: string): HoldersDataTotal | null {
    return store.get("HoldersDataTotal", id) as HoldersDataTotal | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get usersCount(): i32 {
    let value = this.get("usersCount");
    return value.toI32();
  }

  set usersCount(value: i32) {
    this.set("usersCount", Value.fromI32(value));
  }

  get pastUsersCount(): i32 {
    let value = this.get("pastUsersCount");
    return value.toI32();
  }

  set pastUsersCount(value: i32) {
    this.set("pastUsersCount", Value.fromI32(value));
  }
}

export class HoldersDataDay extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save HoldersDataDay entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save HoldersDataDay entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("HoldersDataDay", id.toString(), this);
  }

  static load(id: string): HoldersDataDay | null {
    return store.get("HoldersDataDay", id) as HoldersDataDay | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get date(): i32 {
    let value = this.get("date");
    return value.toI32();
  }

  set date(value: i32) {
    this.set("date", Value.fromI32(value));
  }

  get newUsers(): i32 {
    let value = this.get("newUsers");
    return value.toI32();
  }

  set newUsers(value: i32) {
    this.set("newUsers", Value.fromI32(value));
  }

  get usersCount(): i32 {
    let value = this.get("usersCount");
    return value.toI32();
  }

  set usersCount(value: i32) {
    this.set("usersCount", Value.fromI32(value));
  }

  get pastUsersCount(): i32 {
    let value = this.get("pastUsersCount");
    return value.toI32();
  }

  set pastUsersCount(value: i32) {
    this.set("pastUsersCount", Value.fromI32(value));
  }
}
