import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface StoreDoc extends BaseDoc {
  items: Set<ObjectId>; // items that are included in the store that can be lended
  storeOwner: ObjectId; // the entity that owns the store
}

export default class StoreConcept {
  public readonly stores = new DocCollection<StoreDoc>("stores");

  /**
   * Creates a new store.
   *
   * @param storeOwner the ObjectId of the owner of the store
   * @param items the items to be initially added to the store (optional)
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly created store
   */
  async createStore(storeOwner: ObjectId, items?: Set<ObjectId>): Promise<{ msg: string; storeId: ObjectId }> {
    const _id = await this.stores.createOne({ storeOwner, items: items ?? new Set() });
    return { msg: "Store successfully created!", storeId: _id };
  }

  /**
   * Mutates the store represented by `storeId` by adding a new item to it, `item`.
   * This can only be done if the entity represented by `modifier` is the owner of the store.
   *
   * @param modifier the ObjectId of the modifier of the store
   * @param storeId the ObjectId of the store to be modified
   * @param item the ObjectId of the item to be added to the store
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly updated store
   */
  async addItem(modifier: ObjectId, storeId: ObjectId, itemId: ObjectId): Promise<{ msg: string; storeId: ObjectId }> {
    await this.canModifyStore(modifier, storeId);
    const { items, _id } = (await this.stores.readOne({ _id: storeId, storeOwner: modifier })) as StoreDoc;
    items.add(itemId);
    await this.stores.updateOne({ _id: storeId, storeOwner: modifier }, { items });
    return { msg: "Item successfully added to the store!", storeId: _id };
  }

  /**
   * Mutates the store represented by `storeId` by removing `item` from it.
   * This can only be done if the entity represented by `modifier` is the owner of the store.
   *
   * @param modifier the ObjectId of the modifier of the store
   * @param storeId the ObjectId of the store to be modified
   * @param item the ObjectId of the item to be removed from the store
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly updated store
   */
  async removeItem(modifier: ObjectId, storeId: ObjectId, item: ObjectId): Promise<{ msg: string; storeId: ObjectId }> {
    await this.canModifyStore(modifier, storeId);
    const { items, _id } = (await this.stores.readOne({ _id: storeId, storeOwner: modifier })) as StoreDoc;
    items.delete(item);
    await this.stores.updateOne({ _id: storeId, storeOwner: modifier }, { items });
    return { msg: "Item successfully removed from the store!", storeId: _id };
  }

  /**
   * Gets a store associated with `owner`.
   *
   * @param owner the ObjectId of the owner of the store
   * @returns a promise that resolves to the store associated with `owner`
   * @throws NotFoundError if `owner` isn't the owner of any stores
   */
  async getStoreByOwner(owner: ObjectId): Promise<StoreDoc> {
    const store = await this.stores.readOne({ storeOwner: owner });
    if (!store) {
      throw new NotFoundError(`The store owned by owner with id ${owner} doesn't exist!`);
    }
    return store;
  }

  /**
   * Checks to see if whether a modifier can mutate a given store.
   * Throws an error if any of the following are true:
   *  (1) the store represented by `storeId` doesn't exist
   *  (2) the owner of the store represented by `storeId` doesn't match `modifier`
   *
   * @param modifier the ObjectId of the modifier of the store
   * @param storeId the ObjectId of the store to be checked
   */
  private async canModifyStore(modifier: ObjectId, storeId: ObjectId): Promise<void> {
    const store = await this.stores.readOne({ _id: storeId });
    if (!store) {
      throw new NotFoundError(`The Store with id ${storeId} doesn't exist!`);
    }
    if (store._id.toString() !== modifier.toString()) {
      throw new NotAllowedError(`The modifier with id ${modifier} cannot update the store with id ${storeId}`);
    }
  }
}
