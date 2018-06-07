import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { GroupMembersCollection } from '../common/members-model';
import { GroupsCollection } from '../common/group-model';

Meteor.methods({
  /**
   * Create a group with the creator as the owner.
   * @param name {String}
   * @param description {String}
   * @param slug {String} URI friendly string
   * @param type {String}
   * @param visibility {'open'||'hidden'||'closed'}
   * @param parentGroup {String}
   * @returns {String} MongoDB ID
   */
  'socialize.group.create'(name, description, slug = '', type = 'group', visibility = 'open', parentGroup = null) {
    check(name, String);
    check(description, String);
    check(slug, Match.Maybe(String));
    check(type, String);
    check(visibility, Match.OneOf('open', 'hidden', 'closed'));
    check(parentGroup, Match.Maybe(String));
    GroupsCollection.insert({ name, description, slug, type, visibility });
  },
  /**
   * Join open group as member.
   * @param groupId {String}
   */
  'socialize.group.join'(groupId) {
    check(userId, String);
    // find the group and check that it is open
    const group = GroupsCollection.findOne({ _id: groupId });
    if (group.visibility === 'open') {
      const result = GroupMembersCollection.upsert(
        {
          groupId,
          userId: Meteor.userId()
        },
        {
          $set: { role: 'member' },
          $unset: { removedAt: '' }
        }
      );
      // increment members count
      if (result.numberAffected === 1 || result.insertedId) {
        GroupsCollection.update({ groupId }, { $inc: { membersCount: 1 } });
        return result;
      }
    }
    return false;
  },
  /**
   * Invite the given user to join the given group.
   * @param userId {String}
   * @param groupId {String}
   */
  'socialize.group.inviteUser'(userId, groupId) {
    check(userId, String);
    check(groupId, String);
  },
  /**
   * Remove user from the given group.
   * @param userId {String}
   * @param groupId {String}
   */
  'socialize.group.removeMember'(userId, groupId) {
    check(userId, String);
    check(groupId, String);

    const member = GroupMembersCollection.findOne({ groupId, userId: Meteor.userId() });
    if (member.role === 'owner' || member.role === 'admin') {
      const result = GroupMembersCollection.update({ userId, groupId }, { $set: { removedAt: new Date() } });
      if (result) {
        GroupsCollection.update({ groupId }, { $inc: { membersCount: -1 } });
        return result;
      }
    }
    return false;
  },
  /**
   * Changes users's role in the given group.
   * @param userId {String}
   * @param groupId {String}
   * @param newRole {String}
   */
  'socialize.group.changeRole'(userId, groupId, newRole) {
    check(userId, String);
    check(groupId, String);
    check(newRole, String);

    // check if the current user has the needed role
    const member = GroupMembersCollection.findOne({ groupId, userId: Meteor.userId() });
    if (member.role === 'owner' || member.role === 'admin') {
      return GroupMembersCollection.update({ userId, groupId }, { $set: { role: newRole } });
    }
    return false;
  },
  /**
   * Deletes the group and all membership information.
   * @param groupId {String}
   */
  'socialize.group.delete'(groupId) {
    check(groupId, String);
    // check that user is owner
    const member = GroupMembersCollection.findOne({ groupId, userId: Meteor.userId() });
    if (member.role === 'owner') {
      GroupMembersCollection.remove({ groupId });
      // TODO remove feed
      return GroupsCollection.remove({ _id: groupId });
    }
    return false;
  }
});
