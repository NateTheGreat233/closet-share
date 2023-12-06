import ClothingItemConcept from "./concepts/clothingitem";
import FriendConcept from "./concepts/friend";
import GroupConcept from "./concepts/group";
import PostConcept from "./concepts/post";
import StoreConcept from "./concepts/store";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Store = new StoreConcept();
export const ClothingItem = new ClothingItemConcept();
export const Group = new GroupConcept();
