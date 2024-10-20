import argparse
import dataclasses
from dataclasses import dataclass
from enum import Enum
from typing import Optional
import json
import os


class Direction(Enum):
    NORTH = 0
    SOUTH = 2
    EAST = 1
    WEST = 3


@dataclass
class Item:
    id: str
    is_ground: bool
    is_walkable: bool
    action_id: Optional[str]
    facing: Optional[Direction]
    equipment_id: Optional[int]
    tileset_id: Optional[int]

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "is_ground": self.is_ground,
            "is_walkable": self.is_walkable,
            "action_id": self.action_id,
            "facing": self.facing,
            "equipment_id": self.equipment_id,
            "tileset_id": self.tileset_id,
        }


def last_id(sprites: dict) -> int:
    return max(map(int, sprites.keys()), default=0)


class ItemStore:
    db_path: str

    def __init__(self, db_path: str):
        self.db_path = db_path

    def add(self, item: Item):
        items = self._load()
        items_data = item.as_dict()
        del items_data["id"]

        items[item.id] = items_data

        self._save(items)

    def remove(self, item_id: str):
        items = self._load()
        items.pop(item_id)

        self._save(items)

    def _load(self) -> dict[str, dict]:
        try:
            if not os.path.exists(self.db_path):
                return {}

            with open(self.db_path, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}

    def _save(self, items: dict):
        try:
            self.save_backup()

            if not os.path.exists(self.db_path):
                os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

            with open(self.db_path, "w") as f:
                json.dump(items, f)
        except Exception as e:
            self.restore_backup()

            raise e

    def save_backup(self):
        backup_path = f"{self.db_path}.bak"

        if os.path.exists(self.db_path):
            os.rename(self.db_path, backup_path)

    def restore_backup(self):
        backup_path = f"{self.db_path}.bak"

        if os.path.exists(backup_path):
            os.rename(backup_path, self.db_path)


@dataclass
class AddItemRequest:
    id: str
    is_ground: bool
    is_walkable: bool
    action_id: Optional[str]
    facing: Optional[Direction]
    equipment_id: Optional[int]
    tileset_id: Optional[int]


@dataclass
class RemoveItemRequest:
    id: str


def create_parser():
    parser = argparse.ArgumentParser(prog="item_editor", description="Item editor.")
    parser.add_argument("--output", type=str, help="Output file.")

    sub_parser = parser.add_subparsers(dest="command", help="Command to run.")

    add_parser = sub_parser.add_parser("add", help="Add an item.")
    add_parser.add_argument("id", type=str, help="Item ID.")
    add_parser.add_argument("--is-ground", action="store_true", help="Is ground.")
    add_parser.add_argument("--is-walkable", action="store_true", help="Is walkable.")
    add_parser.add_argument("--action-id", type=str, help="Action ID.")
    add_parser.add_argument(
        "--facing",
        type=int,
        choices=[0, 1, 2, 3],
        help="Facing direction.",
    )
    add_parser.add_argument("--equipment-id", type=int, help="Equipment ID.")
    add_parser.add_argument("--tileset-id", type=int, help="Tileset ID.", required=True)

    remove_parser = sub_parser.add_parser("remove", help="Remove an item.")
    remove_parser.add_argument("id", type=str, help="Item ID.")

    return parser


def create_add_item_request(args) -> AddItemRequest:
    return AddItemRequest(
        id=args.id,
        is_ground=args.is_ground,
        is_walkable=args.is_walkable,
        action_id=args.action_id,
        facing=args.facing,
        equipment_id=args.equipment_id,
        tileset_id=args.tileset_id,
    )


def create_remove_item_request(args) -> RemoveItemRequest:
    return RemoveItemRequest(
        id=args.id,
    )


def handle_add_item(item_store: ItemStore, args: AddItemRequest):
    item = Item(
        id=args.id,
        is_ground=args.is_ground,
        is_walkable=args.is_walkable,
        action_id=args.action_id,
        facing=args.facing,
        equipment_id=args.equipment_id,
        tileset_id=args.tileset_id,
    )

    item_store.add(item)


def handle_remove_item(item_store: ItemStore, args: RemoveItemRequest):
    item_store.remove(args.id)


def handle_command(item_store: ItemStore, command: str, args):
    if command == "add":
        handle_add_item(item_store, create_add_item_request(args))
    elif command == "remove":
        handle_remove_item(item_store, create_remove_item_request(args))


def main():
    parser = create_parser()
    args = parser.parse_args()

    item_store = ItemStore(args.output or "./items.json")

    handle_command(item_store, args.command, args)


if __name__ == "__main__":
    main()
