import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

type BorrowHistory = {
  itemId: ObjectId;
  borrowDate: Date;
  returnDate: Date;
};

export interface BorrowedDoc extends BaseDoc {
  borrowHistory: Set<BorrowHistory>;
  borrower: ObjectId; // entity that is borrowing the items
}

export default class BorrowedConcept {
  public readonly borroweds = new DocCollection<BorrowedDoc>("borroweds");

  /**
   * Creates a new borrowed.
   *
   * @param borrower the ObjectId of the entity borrowing the items
   * @param borrowHistory the item borrow history to be initially added to the Borrowed (optional)
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly created Borrowed
   */
  async createBorrowed(borrower: ObjectId, borrowHistory?: Set<BorrowHistory>): Promise<{ msg: string; borrowedId: ObjectId }> {
    const borrowedId = await this.borroweds.createOne({ borrower, borrowHistory: borrowHistory ?? new Set() });
    return { msg: "Borrowed successfully created!", borrowedId };
  }

  async borrowItem(borrower: ObjectId, itemId: ObjectId, returnDate: Date) {
    await this.doesBorrowedExist({ borrower });
    const { borrowHistory } = (await this.borroweds.readOne({ borrower })) as BorrowedDoc;
    const currentlyBorrowed = this.getCurrentlyBorrowed(borrowHistory);
    if ([...currentlyBorrowed].map((history) => history.itemId).includes(itemId)) {
      throw new NotAllowedError("You cannot borrow an item that you are already borrowing!");
    }

    // add new item to history
    borrowHistory.add({ itemId, borrowDate: new Date(), returnDate });

    // re-write to db
    const updateResult = await this.borroweds.updateOne({ borrower }, { borrowHistory });
    return { msg: "Successfully added item to Borrowed!", borrowedId: updateResult.upsertedId };
  }

  async returnItem(borrower: ObjectId, itemId: ObjectId) {
    await this.doesBorrowedExist({ borrower });
  }

  async getBorrowedByUser(borrower: ObjectId): Promise<BorrowedDoc> {
    await this.doesBorrowedExist({ borrower });
    return (await this.borroweds.readOne({ borrower })) as BorrowedDoc;
  }

  async getCurrentlyBorrowedItems(borrower: ObjectId): Promise<Set<ObjectId>> {
    await this.doesBorrowedExist({ borrower });
    const borrowed = (await this.borroweds.readOne({ borrower })) as BorrowedDoc;
    return new Set([...this.getCurrentlyBorrowed(borrowed.borrowHistory)].map((history) => history.itemId));
  }

  private getCurrentlyBorrowed(borrowHistory: Set<BorrowHistory>): Set<BorrowHistory> {
    const now = new Date();
    return new Set([...borrowHistory].filter((history) => history.returnDate > now));
  }

  private async doesBorrowedExist(filter: Filter<BorrowedDoc>): Promise<void> {
    if ((await this.borroweds.readOne(filter)) === null) {
      throw new NotFoundError("The Borrowed you are requesting doesn't exist!");
    }
  }
}
