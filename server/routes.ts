import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { ClothingItem, Contract, Friend, Group, Post, Store, User, WebSession } from "./app";
import { ClothingItemDoc } from "./concepts/clothingitem";
import { ContractDoc } from "./concepts/contract";
import { GroupDoc } from "./concepts/group";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const newUser = (await User.create(username, password)) as { msg: string; user: UserDoc };
    await Store.createStore(newUser.user._id);
    return newUser;
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  // @Router.get("/store")
  // async getStore(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   const { _id, storeOwner, items } = await Store.getStoreByOwner(user);

  //   // TODO get the ClothingItem objects from the ClothingItemConcept using `items`.
  //   // For now we'll just return a set of the ObjectIds of the ClothingItems.
  //   const clothingItems = items;

  //   return { _id, storeOwner, items: clothingItems };
  // }

  @Router.patch("/store/add/:itemId")
  async addItemToStore(session: WebSessionDoc, itemId: ObjectId) {
    const user = WebSession.getUser(session);
    const storeId = (await Store.getStoreByOwner(user))._id;
    return await Store.addItem(user, storeId, itemId);
  }

  @Router.patch("/store/remove/:itemId")
  async removeItemFromStore(session: WebSessionDoc, itemId: ObjectId) {
    const user = WebSession.getUser(session);
    const storeId = (await Store.getStoreByOwner(user))._id;
    return await Store.removeItem(user, storeId, itemId);
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.get("/clothingItems")
  async getClothingItems(owner?: string) {
    let clothingItems;
    if (owner) {
      const id = (await User.getUserByUsername(owner))._id;
      clothingItems = await ClothingItem.getClothingItems(id);
    } else {
      clothingItems = await ClothingItem.getAllClothingItems({});
    }
    return Responses.clothingItems(clothingItems);
  }

  @Router.get("/store/:owner")
  async getStore(owner: string) {
    const id = (await User.getUserByUsername(owner))._id;
    const clothingItems = await ClothingItem.getClothingItems(id);

    return Responses.clothingItems(clothingItems);
  }

  @Router.get("/borrowedItems/:borrower")
  async getBorrowedItems(borrower: string) {
    const id = (await User.getUserByUsername(borrower))._id;
    const borrowedItems = await ClothingItem.getBorrowedItems(id);

    return Responses.clothingItems(borrowedItems);
  }

  @Router.post("/clothingItems")
  async createClothingItem(session: WebSessionDoc, name: string, description: string, imageUrl: string) {
    const user = WebSession.getUser(session);
    const created = await ClothingItem.create(user, name, description, imageUrl);
    return { msg: created.msg, clothingItem: await Responses.clothingItem(created.clothingItem) };
  }

  @Router.patch("/clothingItems/:_id")
  async updateClothingItem(session: WebSessionDoc, _id: ObjectId, update: Partial<ClothingItemDoc>) {
    const user = WebSession.getUser(session);
    await ClothingItem.isOwner(user, _id);
    return await ClothingItem.update(_id, update);
  }

  @Router.delete("/clothingItems/:_id")
  async deleteClothingItem(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await ClothingItem.isOwner(user, _id);
    return ClothingItem.removeClothingItem(_id);
  }

  @Router.patch("/borrow/clothingItems/:_id")
  async borrow(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await ClothingItem.borrow(_id, user);
  }

  @Router.patch("/return/clothingItems/:_id")
  async returnClothingItem(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await ClothingItem.isBorrower(user, _id);
    return await ClothingItem.returnClothingItem(_id);
  }

  @Router.get("/contracts/:user")
  async getContracts(user?: string) {
    let contracts;
    if (user) {
      const id = (await User.getUserByUsername(user))._id;
      contracts = await Contract.getAllUserContracts(id);
    } else {
      contracts = await Contract.getContracts({});
    }
    return Responses.contracts(contracts);
  }

  @Router.get("/contracts/borrower/:borrower")
  async getBorrowerContracts(borrower: string) {
    const id = (await User.getUserByUsername(borrower))._id;
    const contracts = await Contract.getContractsByBorrower(id);

    return Responses.contracts(contracts);
  }

  @Router.get("/contracts/owner/:owner")
  async getOwnerContracts(owner: string) {
    const id = (await User.getUserByUsername(owner))._id;
    const contracts = await Contract.getContractsByOwner(id);

    return Responses.contracts(contracts);
  }

  @Router.get("/contracts/fromItem/:item")
  async getContractByItem(item: ObjectId) {
    const contract = await Contract.getContractByItem(item);

    return Responses.contract(contract);
  }

  @Router.post("/contracts")
  async proposeContract(session: WebSessionDoc, item: ObjectId, borrowDate: Date, returnDate: Date, notes: string) {
    // Borrower will propose the contract (user that's logged in)
    const borrower = await WebSession.getUser(session);

    const owner = await ClothingItem.getOwner(item);
    const created = await Contract.propose(owner, borrower, item, borrowDate, returnDate, notes);
    return { msg: created.msg, contract: await Responses.contract(created.contract) };
  }

  @Router.patch("/contracts/:_id")
  async modifyContract(session: WebSessionDoc, _id: ObjectId, update: Partial<ContractDoc>) {
    const user = WebSession.getUser(session);
    await Contract.isInvolved(user, _id);

    return await Contract.modify(_id, update);
  }

  @Router.patch("/contracts/finalize/:_id")
  async finalizeContract(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Contract.isInvolved(user, _id);
    return await Contract.finalize(_id);
  }

  @Router.delete("/contracts/:_id")
  async deleteContract(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Contract.isInvolved(user, _id);
    return await Contract.remove(_id);
  }

  @Router.post("/groups")
  async createGroup(session: WebSessionDoc, name: string, imageUrl: string, members?: Array<ObjectId>) {
    const user = WebSession.getUser(session);
    return await Group.createGroup(user, name, imageUrl, members);
  }

  @Router.patch("/groups/:_id")
  async updateGroup(session: WebSessionDoc, _id: ObjectId, update: Partial<GroupDoc>) {
    const user = WebSession.getUser(session);
    return await Group.updateGroup(user, _id, update);
  }

  @Router.delete("/groups/:_id")
  async deleteGroup(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await Group.deleteGroup(user, _id);
  }

  @Router.get("/groups")
  async getGroups() {
    return await Group.getGroups();
  }

  @Router.get("/groups/:name")
  async getGroupByName(name: string) {
    return await Group.getGroups(name);
  }

  @Router.get("/groups/user/:_id")
  async getGroupsOfUser(_id: ObjectId) {
    return await Group.getGroupsByMember(_id);
  }

  @Router.get("/groups/user/:_id/requests")
  async getRequestsByUser(_id: ObjectId) {
    return await Group.getRequestsByUser(_id);
  }

  @Router.get("/group/:_id")
  async getGroupInfoById(_id: ObjectId) {
    return await Group.getGroupById(_id);
  }

  @Router.delete("/group/:_id/user/:userId")
  async removeMember(session: WebSessionDoc, _id: ObjectId, userId: ObjectId) {
    const modifier = WebSession.getUser(session);
    return await Group.removeMember(modifier, _id, userId);
  }

  @Router.get("/group/:_id/requests")
  async getRequestsByGroup(_id: ObjectId) {
    return await Group.getRequestsByGroup(_id);
  }

  @Router.post("/group/:_id")
  async sendGroupRequest(session: WebSessionDoc, _id: ObjectId, userId: ObjectId) {
    const creator = WebSession.getUser(session);
    return await Group.sendRequest(creator, userId, _id);
  }

  @Router.delete("/group/requests/:_id")
  async removeGroupRequest(userId: ObjectId, _id: ObjectId) {
    // should only be accessible by users in the group or user associated with the request
    return await Group.removeRequest(userId, _id);
  }

  @Router.put("/group/accept")
  async acceptGroupRequest(session: WebSessionDoc, userId: ObjectId, groupId: ObjectId) {
    const modifier = WebSession.getUser(session);
    return await Group.acceptRequest(modifier, userId, groupId);
  }

  @Router.put("/group/reject")
  async rejectGroupRequest(session: WebSessionDoc, userId: ObjectId, groupId: ObjectId) {
    const modifier = WebSession.getUser(session);
    return await Group.rejectRequest(modifier, userId, groupId);
  }
}

export default getExpressRouter(new Routes());
