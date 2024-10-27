import argparse
import dataclasses
from dataclasses import dataclass
import json
import os

TILESETS = {
    "room_builder": {
        "id": 0,
        "path": "resources/maps/Room_Builder_16x16.png",
    },
    "modern_office": {
        "id": 10000,
        "path": "resources/maps/Modern_Office_Black_Shadow.png",
    },
    "modern_office_room_builder": {
        "id": 20000,
        "path": "resources/maps/Room_Builder_Office_16x16.png",
    },
    "items": {
        "id": 30000,
        "path": "resources/maps/items.png",
    },
    "animated_glowing_pumpkin": {
        "id": 40000,
        "path": "resources/maps/animated_glowing_pumpkin.png",
    },
    "halloween": {
        "id": 50000,
        "path": "resources/maps/11_Halloween_Black_Shadow_16x16.png",
    },
    "conference_hall": {
        "id": 60000,
        "path": "resources/maps/13_Conference_Hall_Black_Shadow_16x16.png",
    },
    "bathroom": {
        "id": 70000,
        "path": "resources/maps/bathroom.png",
    },
    "basement": {
        "id": 80000,
        "path": "resources/maps/basement.png",
    },
}


@dataclass
class Sprite:
    id: str
    y: int
    width: int
    height: int
    states: list[int]
    tileset: str
    pivot: dict[str, float]
    tileset_id: int


class SpriteStore:
    db_path: str

    def __init__(self, db_path: str):
        self.db_path = db_path

    def add(self, sprite: Sprite):
        sprites = self._load()
        sprite_data = dataclasses.asdict(sprite)
        del sprite_data["id"]

        sprite_id = str(int(sprite.id) + sprite.tileset_id)
        sprites[sprite_id] = sprite_data

        self._save(sprites)

    def remove(self, sprite_id: str):
        sprites = self._load()
        sprites.pop(sprite_id)

        self._save(sprites)

    def _load(self) -> dict[str, dict]:
        try:
            if not os.path.exists(self.db_path):
                return {}

            with open(self.db_path, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}

    def _save(self, sprites: dict):
        try:
            self.save_backup()

            if not os.path.exists(self.db_path):
                os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

            with open(self.db_path, "w") as f:
                json.dump(sprites, f)
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
class AddSpriteRequest:
    id: str
    y: int
    width: int
    height: int
    states: list[int]
    tileset: str
    tileset_id: int
    pivot: dict[str, float]


@dataclass
class RemoveSpriteRequest:
    id: str


def create_parser():
    parser = argparse.ArgumentParser(prog="sprite_editor", description="Sprite editor.")
    parser.add_argument(
        "--output",
        help="Output file path.",
    )

    sub_parser = parser.add_subparsers(dest="command", help="Command to run.")

    add_parser = sub_parser.add_parser("add", help="Add a sprite.")
    add_parser.add_argument("id", type=str, help="Sprite ID.")
    add_parser.add_argument("--y", type=int, help="Y position.", required=True)
    add_parser.add_argument("--width", type=int, help="Width.", required=True)
    add_parser.add_argument("--height", type=int, help="Height.", required=True)
    add_parser.add_argument(
        "--states", nargs="+", type=int, help="States.", required=True
    )
    add_parser.add_argument(
        "--tileset", choices=TILESETS.keys(), help="Tileset.", required=True
    )
    add_parser.add_argument("--pivot-x", type=float, help="Pivot X.")
    add_parser.add_argument("--pivot-y", type=float, help="Pivot Y.")

    remove_parser = sub_parser.add_parser("remove", help="Remove a sprite.")
    remove_parser.add_argument("id", help="Sprite ID.")

    return parser


def create_add_sprite_request(args) -> AddSpriteRequest:
    return AddSpriteRequest(
        id=args.id,
        y=args.y,
        width=args.width,
        height=args.height,
        states=args.states,
        tileset=TILESETS[args.tileset]["path"],
        tileset_id=TILESETS[args.tileset]["id"],
        pivot={"x": args.pivot_x, "y": args.pivot_y},
    )


def handle_add_sprite(sprite_store: SpriteStore, request: AddSpriteRequest):
    sprite_store.add(
        Sprite(
            id=request.id,
            y=request.y,
            width=request.width,
            height=request.height,
            states=request.states,
            tileset=request.tileset,
            tileset_id=request.tileset_id,
            pivot=request.pivot,
        )
    )


def create_remove_sprite_request(args) -> RemoveSpriteRequest:
    return RemoveSpriteRequest(
        id=args.id,
    )


def handle_remove_sprite(sprite_store: SpriteStore, request: RemoveSpriteRequest):
    sprite_store.remove(request.id)


def handle_command(sprite_store: SpriteStore, command: str, args):
    if command == "add":
        handle_add_sprite(sprite_store, create_add_sprite_request(args))
    elif command == "remove":
        handle_remove_sprite(sprite_store, create_remove_sprite_request(args))


def main():
    parser = create_parser()
    args = parser.parse_args()

    sprite_store = SpriteStore(args.output or "./sprites.json")

    handle_command(sprite_store, args.command, args)


if __name__ == "__main__":
    main()
