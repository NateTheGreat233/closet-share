import { User } from "./app";
import { ClothingItemDoc } from "./concepts/clothingitem";
import { ContractDoc } from "./concepts/contract";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friend";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await User.getUserById(post.author);
    return { ...post, author: author.username };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await User.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  /**
   * Convert ClothingItemDoc into more readable format for the frontend.
   */
  static async clothingItem(clothingItem: ClothingItemDoc | null) {
    if (!clothingItem) {
      return clothingItem;
    }
    const owner = await User.getUserById(clothingItem.owner);
    return { ...clothingItem, author: owner.username };
  }

  /**
   * Same as {@link clothingItem} but for an array of ClothingItemDoc for improved performance.
   */
  static async clothingItems(clothingItems: ClothingItemDoc[]) {
    const owners = await User.idsToUsernames(clothingItems.map((clothingItem) => clothingItem.owner));
    return clothingItems.map((clothingItem, i) => ({ ...clothingItem, owner: owners[i] }));
  }

  /**
   * Convert ContractDoc into more readable format for the frontend.
   */
  static async contract(contract: ContractDoc | null) {
    if (!contract) {
      return contract;
    }
    const borrower = await User.getUserById(contract.borrower);
    const owner = await User.getUserById(contract.owner);
    return { ...contract, owner: owner.username, borrower: borrower.username };
  }

  /**
   * Same as {@link contract} but for an array of ContractDoc for improved performance.
   */
  static async contracts(contracts: ContractDoc[]) {
    const owners = await User.idsToUsernames(contracts.map((contract) => contract.owner));
    const borrowers = await User.idsToUsernames(contracts.map((contract) => contract.borrower));

    return contracts.map((contract, i) => ({ ...contract, owner: owners[i], borrower: borrowers[i] }));
  }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await User.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
