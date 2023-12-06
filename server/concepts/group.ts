import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
  name: string; // name doesn't have to be unique
  creator: string;
  members: Array<ObjectId>;
}

export interface GroupRequestDoc extends BaseDoc {
  user: ObjectId;
  invitation: boolean; // true when a user is invited to a group, false otherwise (user asks to join)
  groupId: ObjectId;
  status: "pending" | "rejected" | "accepted";
}

export default class GroupConcept {
  public readonly groups = new DocCollection<GroupDoc>("groups");
  public readonly requests = new DocCollection<GroupRequestDoc>("groupRequests");

  /**
   * Creates a new group.
   *
   * @param creator the ObjectId of the owner of the group and initial member
   * @param name the string identifier for the group
   * @param otherMembers the people initially added to the group (optional)
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly created group
   */
  async createGroup(creator: ObjectId, name: string, otherMembers = new Array<ObjectId>()) {
    this.isNameValid(name);
    const members = otherMembers.concat([creator]);
    const _id = await this.groups.createOne({ name, members });
    return { msg: `Group ${name} successfully created!`, group: await this.groups.readOne({ _id }) };
  }

  /**
   * Mutates the group represented by `groupId` by adding a new member to it, `member`.
   * This can only be done if the entity represented by `modifier` is a member of the group
   *
   * @param modifier the ObjectId of the modifier of the group
   * @param groupId the ObjectId of the group to be modified
   * @param memberId the ObjectId of the member to be added to the group
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly updated group
   */
  async addMember(modifier: ObjectId, groupId: ObjectId, memberId: ObjectId): Promise<{ msg: string; groupId: ObjectId }> {
    await this.canModifyGroup(modifier, groupId);
    const { members, _id } = (await this.groups.readOne({ _id: groupId })) as GroupDoc;
    members.concat([memberId]);
    await this.groups.updateOne({ _id: groupId }, { members });
    return { msg: `Member with id ${memberId} was successfully added to the group!`, groupId: _id };
  }

  /**
   * Mutates the group represented by `groupId` by removing a member from it, `member`.
   * This can only be done if the entity represented by `modifier` is a member of the group
   *
   * @param modifier the ObjectId of the modifier of the group
   * @param groupId the ObjectId of the group to be modified
   * @param memberId the ObjectId of the member to be removed from the group
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly updated group
   */
  async removeMember(modifier: ObjectId, groupId: ObjectId, memberId: ObjectId): Promise<{ msg: string; groupId: ObjectId }> {
    await this.canModifyGroup(modifier, groupId);
    const { members, _id } = (await this.groups.readOne({ _id: groupId })) as GroupDoc;
    await this.groups.updateOne({ _id: groupId }, { members: members.filter((id) => id.toString() !== memberId.toString()) });
    return { msg: `Member with id ${memberId} was successfully removed from the group!`, groupId: _id };
  }

  /**
   * Deletes the group represented by `groupId`
   * This can only be done if the entity represented by `modifier` is a member of the group
   *
   * @param modifier the ObjectId of the modifier of the group
   * @param groupId the ObjectId of the group to be modified
   * @returns a promise that resolves to an object that contains a successful deletion message
   */
  async deleteGroup(modifier: ObjectId, groupId: ObjectId): Promise<{ msg: string }> {
    await this.canModifyGroup(modifier, groupId);
    await this.groups.deleteOne({ _id: groupId });
    return { msg: `The group with Id ${groupId} was successfully deleted!` };
  }

  /**
   * Mutates the group represented by `groupId` by updating the associated name to `groupName`
   * This can only be doen if the entity represented by `modifier` is a member of the group
   *
   * @param modifier the ObjectId of the modifier of the group
   * @param groupId the ObjectId of the group to be modified
   * @param groupName the new string name to be updated to
   * @returns a promise that resolves to an object that contains a success message and the ObjectId of the newly updated group
   */
  async updateName(modifier: ObjectId, groupId: ObjectId, groupName: string): Promise<{ msg: string; groupId: ObjectId }> {
    this.isNameValid(groupName);
    await this.canModifyGroup(modifier, groupId);
    await this.groups.updateOne({ _id: groupId }, { name: groupName });
    const { name, _id } = (await this.groups.readOne({ _id: groupId })) as GroupDoc;
    return { msg: `The group's name was successfully updated to ${name}!`, groupId: _id };
  }

  /*
   * Gets a group with the name `name`.
   *
   * @param name the string identifier of a group (optional)
   * @returns a promise that resolves into a list of groups with the name attribute, `name`
   * @throws NotFoundError if `name` isn't the name of any groups
   */
  async getGroups(name?: string): Promise<GroupDoc[]> {
    // If name is undefined, return all groups by applying empty filter
    const filter = name ? { name } : {};
    const groups = await this.groups.readMany(filter);
    if (!groups) {
      throw new NotFoundError(`The group with name ${name} does not exist!`);
    }
    return groups;
  }

  /**
   * Gets a group with the groupId with `groupId`.
   *
   * @param groupId the ObjectId of the group
   * @returns a promise that resolves to a group with the ObjectId `groupId`
   * @throws NotFoundError if `groupId` isn't the id of any groups
   */
  async getGroupById(groupId: ObjectId): Promise<GroupDoc> {
    const group = await this.groups.readOne({ _id: groupId });
    if (!group) {
      throw new NotFoundError(`The group with id ${groupId} does not exist!`);
    }
    return group;
  }

  /**
   * Gets the groups of a given member.
   *
   * @param memberId the ObjectId of the member
   * @returns a promise that resolves into a list of groups with member, `memberId`
   * @throws NotFoundError if there are no existing groups
   */
  async getGroupsByMember(memberId: ObjectId): Promise<GroupDoc[]> {
    const groups = await this.groups.readMany({});
    if (!groups) {
      throw new NotFoundError(`There are no groups!`);
    }
    return groups.filter((group) => group.members.map((id) => id.toString()).includes(memberId.toString()));
  }

  /**
   * Gets all requests associated with a user
   *
   * @param user the ObjectId of the user in question
   * @returns a promise that resolves into a list of group requests associated with user, `user`
   */
  async getRequestsByUser(user: ObjectId): Promise<GroupRequestDoc[]> {
    return await this.requests.readMany({ user });
  }

  /**
   * Gets all requests associated with a `group`
   *
   * @param groupId the ObjectId of the group in question
   * @returns a promise that resolves into a list of group requests associated with group, `group`
   */
  async getRequestsByGroup(groupId: ObjectId): Promise<GroupRequestDoc[]> {
    return await this.requests.readMany({ groupId });
  }

  /**
   *  Creates a requests with status "pending"
   *   (1) User is invited
   *       - creator must be a member of the group already
   *       - creator of the request is not the same as the user associated with the request
   *   (2) User requests to join
   *       - creator is not a member of the group already
   *       - creator of the request is the same as the user associated with the request
   *
   * @param creator the ObjectId of the user creating the request
   * @param user the ObjectId of the user the request is for
   * @param groupId the ObjectId of the group that request is for
   * @returns a promise that resolves to an object that contains a success message
   */
  async sendRequest(creator: ObjectId, user: ObjectId, groupId: ObjectId): Promise<{ msg: string }> {
    const invitation = creator.toString() !== user.toString();
    await this.canSendRequest(creator, user, groupId, invitation);
    await this.requests.createOne({ user, groupId, invitation, status: "pending" });
    return { msg: "Sent request!" };
  }

  /**
   * Modifies the request by changing the status to "accepted"
   *
   * @param modifier the ObjectId of the user modifying/updating the request
   * @param user the ObjectId of the user the request is associated with
   * @param group the ObjectId of the group that request is for
   * @returns a promise that resolves to an object that contains a success message of acceptance
   */
  async acceptRequest(modifier: ObjectId, user: ObjectId, groupId: ObjectId): Promise<{ msg: string; groupId: ObjectId }> {
    await this.canModifyRequest(modifier, user, groupId);

    const { invitation } = (await this.removePendingRequest(user, groupId)) as GroupRequestDoc;
    void this.requests.createOne({ user, invitation, groupId, status: "accepted" });
    const { members, _id } = (await this.groups.readOne({ _id: groupId })) as GroupDoc;
    await this.groups.updateOne({ _id: groupId }, { members: members.concat([user]) });
    return { msg: `Member with id ${user} was successfully added to the group!`, groupId: _id };
  }

  /**
   * Modifies the request by changing the status to "rejected"
   *
   * @param modifier the ObjectId of the user modifying/updating the request
   * @param user the ObjectId of the user the request is associated with
   * @param group the ObjectId of the group that request is for
   * @returns a promise that resolves to an object that contains a success message of rejection
   */
  async rejectRequest(modifier: ObjectId, user: ObjectId, groupId: ObjectId): Promise<{ msg: string }> {
    await this.canModifyRequest(modifier, user, groupId);

    const { invitation } = (await this.removePendingRequest(user, groupId)) as GroupRequestDoc;
    void this.requests.createOne({ user, invitation, groupId, status: "rejected" });
    return { msg: "Rejected request!" };
  }

  /**
   *
   * @param user the ObjectId of the user the request is associated with
   * @param group the ObjectId of the group that request is for
   * @returns a promise that resolves to an object that contains a success message of removal
   */
  async removeRequest(user: ObjectId, groupId: ObjectId): Promise<{ msg: string }> {
    await this.removePendingRequest(user, groupId);
    return { msg: "Removed request!" };
  }

  /**
   * Check to see whether is a user is able to send an invitation request
   * Throws an error if:
   *  (1) the request for the user and group already exists
   *  (2) the creator is not a member of the group already
   *
   * @param user the ObjectId of second user
   * @param group the ObjectId of the group that request is for
   */
  private async canSendRequest(creator: ObjectId, user: ObjectId, groupId: ObjectId, invitation: boolean): Promise<void> {
    const group = await this.groups.readOne({ _id: groupId });
    if (!group) throw new NotFoundError(`The Group with id ${groupId} does not exist!`);
    if (invitation && !group.members.map((id) => id.toString()).includes(creator.toString())) throw new GroupRequestNotAllowedError(creator, groupId);

    // check if there is pending request
    const request = await this.requests.readOne({
      user,
      groupId,
      status: "pending",
    });
    if (request !== null) {
      throw new GroupRequestAlreadyExistsError(user, groupId);
    }
  }

  /**
   * Checks if the modifier is able to make updates to the request
   * Throws an error if:
   *  (1) the request does not exists
   *  (2) user received an invitation, but another user attempts to update the request
   *  (3) user asks to join, and tries to update their own request
   *
   * @param modifier the ObjectId of user making the update
   * @param user the ObjectId of the user associated with the request
   * @param groupId the ObjectId of the group associated with the request
   */
  private async canModifyRequest(modifier: ObjectId, user: ObjectId, groupId: ObjectId): Promise<void> {
    const request = await this.requests.readOne({ user, groupId, status: "pending" });

    if (request === null) {
      throw new GroupRequestNotFoundError(user, groupId);
    } else if (request.invitation && modifier.toString() !== user.toString()) {
      // user was invited so the modifier must be the user
      throw new GroupRequestNotAllowedError(modifier, groupId);
    } else if (!request.invitation) {
      if (modifier.toString() === user.toString()) {
        throw new GroupRequestNotAllowedError(modifier, groupId);
      }
      await this.canModifyGroup(modifier, groupId);
    }
  }

  /**
   *
   * @param user the ObjectId of the user who the request is for
   * @param groupId the ObjectId of the group that request is for
   * @returns a promise that resolves into the group request
   */
  private async removePendingRequest(user: ObjectId, groupId: ObjectId): Promise<GroupRequestDoc> {
    const request = await this.requests.popOne({ user, groupId, status: "pending" });
    if (request === null) {
      throw new GroupRequestNotFoundError(user, groupId);
    }
    return request;
  }

  /**
   * Checks to see if whether a modifier can mutate a given group.
   * Throws an error if any of the following are true:
   *  (1) the group represented by `groupId` doesn't exist
   *  (2) the `modifier` is a not a member of the group
   *
   * @param modifier the ObjectId of the modifier of the group
   * @param groupId the ObjectId of the group to be checked
   */
  private async canModifyGroup(modifier: ObjectId, groupId: ObjectId): Promise<void> {
    const group = await this.groups.readOne({ _id: groupId });
    if (!group) {
      throw new NotFoundError(`The Group with id ${groupId} does not exist!`);
    }
    if (!group.members.map((id) => id.toString()).includes(modifier.toString())) {
      throw new GroupRequestNotAllowedError(modifier, groupId);
    }
  }

  /**
   * Checks to see whether the provided name is valid
   * Throws an error if the name is an empty string
   *
   * @param name string identifier for a group
   */
  private isNameValid(name: string) {
    if (!name) {
      throw new BadValuesError("Group name cannot be empty!");
    }
  }
}

export class GroupRequestNotFoundError extends NotFoundError {
  constructor(
    public readonly user: ObjectId,
    public readonly groupId: ObjectId,
  ) {
    super(`Request for ${user} to join group ${groupId} does not exist!`);
  }
}

export class GroupRequestAlreadyExistsError extends NotAllowedError {
  constructor(
    public readonly userId: ObjectId,
    public readonly groupId: ObjectId,
  ) {
    super(`Request for ${userId} to join group ${groupId} already exists!`);
  }
}

export class GroupRequestNotAllowedError extends NotAllowedError {
  constructor(
    public readonly modifier: ObjectId,
    public readonly groupId: ObjectId,
  ) {
    super(`User ${modifier} is not allowed to perform this action on group ${groupId}`);
  }
}
