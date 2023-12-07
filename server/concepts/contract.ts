import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ContractDoc extends BaseDoc {
  owner: ObjectId;
  borrower: ObjectId;
  item: ObjectId;
  borrowDate: Date;
  returnDate: Date;
  notes: string;
  finalized: boolean;
}

export default class ContractConcept {
  public readonly contracts = new DocCollection<ContractDoc>("contracts");

  /**
   * Proposes an unfinalized contract (basically initiates it and creates an entry in the db).
   * finalized will be set to false in the database.
   * @param owner the owner of the item
   * @param borrower the borrower of the item
   * @param item the item for which this contract is initiated
   * @param borrowDate the date that the borrower starts borrowing
   * @param returnDate the date that the borrower will return the item
   * @param notes any specifications for the contract
   * @returns a promise that will resolve to the contract with given parameters
   */
  async propose(owner: ObjectId, borrower: ObjectId, item: ObjectId, borrowDate: Date, returnDate: Date, notes: string) {
    const _id = await this.contracts.createOne({ owner, borrower, item, borrowDate, returnDate, notes, finalized: false });
    return { msg: "Contract successfully proposed!", contract: await this.contracts.readOne({ _id }) };
  }

  /**
   * Gets all contracts where the given user is the owner of the item.
   * @param owner the id of the owner
   * @returns a promise that will resolve to a list of contracts where that user is the owner
   */
  async getContractsByOwner(owner: ObjectId) {
    const contracts = await this.contracts.readMany(
      { owner },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return contracts;
  }

  /**
   * Gets all contracts where the given user is the borrower of the item.
   * @param borrower the id of the borrower
   * @returns a promise that will resolve to a list of contracts where that user is the borrower
   */
  async getContractsByBorrower(borrower: ObjectId) {
    const contracts = await this.contracts.readMany(
      { borrower },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return contracts;
  }

  /**
   * Retrieves all contracts that a user is involved in (as borrower or owner)
   * @param user the id of the user in question
   * @returns a promise that will resolve to a list of contracts that includes the user
   */
  async getAllUserContracts(user: ObjectId) {
    const ownerContracts = await this.getContractsByOwner(user);
    const borrowerContracts = await this.getContractsByBorrower(user);

    const allContracts = ownerContracts.concat(borrowerContracts);

    return allContracts;
  }

  /**
   * Gets all contracts that match the query
   * @param query a given ContractDoc query
   * @returns a promise that will resolve into a list of contracts matching the query
   */
  async getContracts(query: Filter<ContractDoc>) {
    const contracts = await this.contracts.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return contracts;
  }

  /**
   * Gets all object ids associated with the contracts where the user is the owner
   * @param owner the id of the owner
   * @returns a promise that will resolve into a list of object ids of the contracts where the user is the owner
   */
  async getContractIdsByOwner(owner: ObjectId) {
    const contracts = await this.getContractsByOwner(owner);

    return contracts.map((contract) => contract._id);
  }

  /**
   * Gets all object ids associated with the contracts where the user is the borrower
   * @param borrower the id of the borrower
   * @returns a promise that will resolve into a list of object ids of the contracts where the user is the borrower
   */
  async getContractIdsByBorrower(borrower: ObjectId) {
    const contracts = await this.getContractsByBorrower(borrower);

    return contracts.map((contract) => contract._id);
  }

  /**
   * Gets all object ids associated with the contracts that the user is involved in as borrower or owner
   * @param user the id of the user in question
   * @returns a promise that will resolve into a list of object ids of all contracts a user is involved in
   */
  async getContractIdsByUser(user: ObjectId) {
    const contracts = await this.getAllUserContracts(user);

    return contracts.map((contract) => contract._id);
  }

  /**
   * Fetches a contract by its object id.
   * @param _id the id of the specified contract
   * @returns  a promise that will resolve into the contract with the given id
   */
  async getContractById(_id: ObjectId) {
    return await this.contracts.readOne({ _id });
  }

  /**
   * Fetches a contract by its item's id.
   * @param item the id of the item of the contract
   * @returns  a promise that will resolve into the contract associated with the given item
   */
  async getContractByItem(item: ObjectId) {
    return await this.contracts.readOne({ item });
  }

  /**
   * Modifies a proposed contract. Cannot modify the owner, borrower, and item fields.
   * Also cannot modify a finalized contract.
   * @param contractId the id of the contract in question
   * @param update a partial ContractDoc with the fields to be updated
   * @returns a promise that will resolve into the updated contract
   */
  async modify(contractId: ObjectId, update: Partial<ContractDoc>) {
    const contract = await this.getContractById(contractId);

    if (!contract?.finalized) {
      this.sanitizeUpdate(update);
      await this.contracts.updateOne({ contractId }, update);
      return { msg: "Contract successfully updated!" };
    } else {
      return { msg: "Cannot modify a finalized contract!" };
    }
  }

  /**
   * Finalizes a given contract. This means that no further changes can be made to it.
   * @param contract the id of the contract to be finalized
   */
  async finalize(contract: ObjectId) {
    // Should update the finalize field to be true
    await this.modify(contract, { finalized: true });
    return { msg: "Contract successfully finalized!" };
  }

  /**
   * Removes a contract with the given id.
   * @param contract the id of the contract to be deleted
   * @returns a message that the contract was successfully deleted
   */
  async remove(contract: ObjectId) {
    await this.contracts.deleteOne({ contract });
    return { msg: "Contract deleted successfully!" };
  }

  /**
   * Throws an error if the contract doesn't exist or the user is neither the borrower nor the owner in the contract
   * @param user the id of the user
   * @param _id the id of the contract
   */
  async isInvolved(user: ObjectId, _id: ObjectId) {
    const contract = await this.contracts.readOne({ _id });
    if (!contract) {
      throw new NotFoundError(`Clothing item ${_id} does not exist!`);
    }
    if (contract.owner.toString() !== user.toString() && contract.borrower.toString() !== user.toString()) {
      throw new ContractPartyNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<ContractDoc>) {
    // Make sure the update cannot change the borrower/owner or item.
    const allowedUpdates = ["borrowDate", "returnDate", "notes", "finalized"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class ContractPartyNotMatchError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not involved in contract {1}!", user, _id);
  }
}
