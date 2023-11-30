import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ClothingItemDoc extends BaseDoc {
  name: String;
  description: String;
  owner: ObjectId;
  borrower: ObjectId;
  imageUrl: string;
}

export default class ClothingItemConcept {
  public readonly clothingItems = new DocCollection<ClothingItemDoc>("clothingItems");

  async create(owner: ObjectId, name: string, description: string, imageUrl: string) {
    const _id = await this.clothingItems.createOne({ owner, name, description, imageUrl });
    return { msg: "Clothing Item successfully created!", clothingItem: await this.clothingItems.readOne({ _id }) };
  }

  async getClothingItems(owner: ObjectId) {
    const clothingItems = await this.clothingItems.readMany(
      { owner },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return clothingItems;
  }

  async getAllClothingItems(query: Filter<ClothingItemDoc>) {
    const clothingItems = await this.clothingItems.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return clothingItems;
  }

  async getClothingItemIdsByOwner(owner: ObjectId) {
    const clothingItems = await this.getClothingItems(owner);

    return clothingItems.map((clothingItem) => clothingItem._id);
  }

  async getClothingItemById(_id: ObjectId) {
    return await this.clothingItems.readOne({ _id });
  }

  async update(_id: ObjectId, update: Partial<ClothingItemDoc>) {
    this.sanitizeUpdate(update);
    await this.clothingItems.updateOne({ _id }, update);
    return { msg: "Clothing item successfully updated!" };
  }

  async borrow(item: ObjectId, borrower: ObjectId) {
    // To represent someone borrowing the item, should just update the borrower field
    await this.update(item, { borrower });
  }

  async returnClothingItem(item: ObjectId) {
    // To represent someone removing the item, should just clear the borrower field
    await this.update(item, { borrower: undefined });
  }

  async removeClothingItem(item: ObjectId) {
    await this.clothingItems.deleteOne({ item });
    return { msg: "Clothing item deleted successfully!" };
  }

  async isOwner(user: ObjectId, _id: ObjectId) {
    const clothingItem = await this.clothingItems.readOne({ _id });
    if (!clothingItem) {
      throw new NotFoundError(`Clothing item ${_id} does not exist!`);
    }
    if (clothingItem.owner.toString() !== user.toString()) {
      throw new ClothingItemOwnerNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<ClothingItemDoc>) {
    // Make sure the update cannot change the owner.
    const allowedUpdates = ["name", "description", "borrower", "imageUrl"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class ClothingItemOwnerNotMatchError extends NotAllowedError {
  constructor(
    public readonly owner: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the owner of clothing item {1}!", owner, _id);
  }
}
