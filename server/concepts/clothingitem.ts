import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ClothingItemDoc extends BaseDoc {
  name: string;
  description: string;
  owner: ObjectId;
  borrower: ObjectId;
  imageUrl: string;
}

export default class ClothingItemConcept {
  public readonly clothingItems = new DocCollection<ClothingItemDoc>("clothingItems");

  /**
   * Adds a clothing item to a user's storefront.
   * @param owner the user the clothing item belongs to
   * @param name the name of the clothing item
   * @param description the description of the clothing item
   * @param imageUrl the url for the image associated with the clothing item
   * @returns a promise that resolves to the clothing item associated with the parameters
   */
  async create(owner: ObjectId, name: string, description: string, imageUrl: string) {
    const _id = await this.clothingItems.createOne({ owner, name, description, imageUrl });
    return { msg: "Clothing Item successfully created!", clothingItem: await this.clothingItems.readOne({ _id }) };
  }

  /**
   * Gets all clothing items associated with the given user id (if not provided, returns all clothing item listings)
   * @param owner the user whose clothing items you are fetching
   * @returns a promise that will resolve to a list of clothing items associated with the owner
   */
  async getClothingItems(owner: ObjectId) {
    const clothingItems = await this.clothingItems.readMany(
      { owner },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return clothingItems;
  }

  /**
   * Get the owner of the clothing item
   * @param item the id of the clothing item
   */
  async getOwner(item: ObjectId) {
    const clothingItem = await this.getClothingItemById(item);

    if (clothingItem) {
      return clothingItem.owner;
    } else {
      throw new NotFoundError(`Clothing item ${item} does not exist!`);
    }
  }

  /**
   * Gets all clothing items associated with the query
   * @param query a given query
   * @returns a promise that resolves to a list of clothing items matching the query
   */
  async getAllClothingItems(query: Filter<ClothingItemDoc>) {
    const clothingItems = await this.clothingItems.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return clothingItems;
  }

  /**
   * Gets all clothing item ids associated with a given owner
   * @param owner the object id of the user in question
   * @returns a promise that resolves to a list of the object ids of the clothing items associated with the owner
   */
  async getClothingItemIdsByOwner(owner: ObjectId) {
    const clothingItems = await this.getClothingItems(owner);

    return clothingItems.map((clothingItem) => clothingItem._id);
  }

  /**
   * Gets a clothing item given an id
   * @param _id the id of a clothing item
   * @returns a promise that will resolve to the clothing item that is associated with the given id
   */
  async getClothingItemById(_id: ObjectId) {
    return await this.clothingItems.readOne({ _id });
  }

  /**
   * Update a existing clothing item listing.
   * @param _id the object id of the clothing item listing to update
   * @param update the parameters to update
   * @returns a message that the clothing item was successfully updated
   */
  async update(_id: ObjectId, update: Partial<ClothingItemDoc>) {
    this.sanitizeUpdate(update);
    await this.clothingItems.updateOne({ _id }, update);
    return { msg: "Clothing item successfully updated!" };
  }

  /**
   * Initiates a borrow transaction on behalf of the given user
   * @param item the id of the item to be borrowed
   * @param borrower the id of the user who is borrowing the item
   */
  async borrow(_id: ObjectId, borrower: ObjectId) {
    // Check if user is borrowing already first
    const clothingItem = await this.clothingItems.readOne({ _id });

    if (!clothingItem) {
      throw new NotFoundError(`Clothing item ${_id} does not exist!`);
    } else if (clothingItem.borrower == borrower) {
      throw new AlreadyBorrowingItemError(borrower, _id);
    } else if (clothingItem.borrower !== undefined && clothingItem.borrower !== null) {
      // Means someone else is already borrowing the item, can't borrow it
      throw new AnotherUserAlreadyBorrowingItemError(clothingItem.borrower, _id);
    } else {
      // To represent someone borrowing the item, should just update the borrower field
      await this.update(_id, { borrower: borrower });
      return { msg: "Clothing item successfully borrowed!" };
    }
  }

  /**
   * Returns a clothing item (no longer being borrowed)
   * @param item the item to be returned
   */
  async returnClothingItem(item: ObjectId) {
    // To represent someone removing the item, should just clear the borrower field
    await this.update(item, { borrower: undefined });
    return { msg: "Clothing item successfully returned!" };
  }

  /**
   * Gets all clothing items currently being borrowed by the user in question
   * @param borrower the object id of the user
   * @returns a promise that resolves to a list of the clothing items being borrowed by the user
   */
  async getBorrowedItems(borrower: ObjectId) {
    const borrowedItems = await this.clothingItems.readMany(
      { borrower: borrower },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return borrowedItems;
  }

  /**
   * Gets all clothing item ids associated with a given borrower
   * @param borrower the object id of the user in question
   * @returns a promise that resolves to a list of the object ids of the clothing items borrowed by a user
   */
  async getBorrowedItemIds(borrower: ObjectId) {
    const borrowedItems = await this.getBorrowedItems(borrower);

    return borrowedItems.map((clothingItem) => clothingItem._id);
  }

  /**
   * Gets all clothing items currently available (not being borrowed), and that don't belong to that user
   * Basically, all borrowable items by the user
   * @param user the object id of the user
   * @returns a promise that resolves to a list of the clothing items that can be borrowed by the user
   */
  async getBorrowableItems(user: ObjectId) {
    const unborrowedItems = await this.clothingItems.readMany(
      { borrower: { $exists: false } },
      {
        sort: { dateUpdated: -1 },
      },
    );

    return unborrowedItems.filter((item) => {
      return item.owner !== user;
    });
  }

  /**
   * Gets all borrowable clothing items associated with the query
   * @param query a given query
   * @returns a promise that resolves to a list of clothing items matching the query
   */
  async getAllBorrowableClothingItems(query: Filter<ClothingItemDoc>) {
    const borrowableClothingItems = await this.clothingItems.readMany(
      { ...query, borrower: undefined },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return borrowableClothingItems;
  }

  /**
   * Deletes a clothing item from a storefront.
   * @param item the id of the clothing item object to be deleted
   * @returns a message that the clothing item was deleted successfully
   */
  async removeClothingItem(item: ObjectId) {
    await this.clothingItems.deleteOne({ _id: item });
    return { msg: "Clothing item deleted successfully!" };
  }

  /**
   * Checks if the given user is the owner of the given clothing item
   * @param user the given user
   * @param _id the id of the clothing item
   */
  async isOwner(user: ObjectId, _id: ObjectId) {
    const clothingItem = await this.clothingItems.readOne({ _id });
    if (!clothingItem) {
      throw new NotFoundError(`Clothing item ${_id} does not exist!`);
    }
    if (clothingItem.owner.toString() !== user.toString()) {
      throw new ClothingItemOwnerNotMatchError(user, _id);
    }
  }

  /**
   * Checks if the given user is the borrower of the given clothing item
   * @param user the given user
   * @param _id the id of the clothing item
   */
  async isBorrower(user: ObjectId, _id: ObjectId) {
    const clothingItem = await this.clothingItems.readOne({ _id });
    if (!clothingItem) {
      throw new NotFoundError(`Clothing item ${_id} does not exist!`);
    }
    if (clothingItem.borrower.toString() !== user.toString()) {
      throw new ClothingItemBorrowerNotMatchError(user, _id);
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
export class ClothingItemBorrowerNotMatchError extends NotAllowedError {
  constructor(
    public readonly borrower: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the borrower of clothing item {1}!", borrower, _id);
  }
}

export class AlreadyBorrowingItemError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is already borrowing clothing item {1}", user, _id);
  }
}

export class AnotherUserAlreadyBorrowingItemError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("Another user {0} is already borrowing clothing item {1}", user, _id);
  }
}
