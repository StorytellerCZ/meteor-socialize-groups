import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { GroupMembersCollection } from '../common/members-model';
import { GroupsCollection } from '../common/group-model';

/**
 * Publish a list of groups with basic info.
 * @param visibility {'all'||'visible'||'open'||'closed'||'hidden'}
 * @param options {Object}
 * @param parentGroup {String}
 */
Meteor.publish(
  'socialize.group.list',
  (visibility = 'visible', options = { limit: 20, skip: 0, sort: { createdAt: -1 } }, parentGroup = null) => {
    check(visibility, Match.OneOf('all', 'open', 'hidden', 'closed', 'visible'));
    check(
      options,
      Match.Maybe(
        Match.ObjectIncluding({
          limit: Number,
          skip: Number,
          sort: Match.Maybe(Match.Object())
        })
      )
    );
    check(parentGroup, Match.Maybe(String));

    options.fields = {
      name: 1,
      type: 1,
      visibility: 1,
      slug: 1,
      parentGroup: 1,
      membersCount: 1
    };

    // select visibility
    let selector = { visibility };
    if (visibility === 'all') {
      selector = {};
    }
    if (visibility === 'visible') {
      selector = { $or: [{ visibility: 'closed' }, { visibility: 'open' }] };
    }

    // select parent group
    if (parentGroup) {
      selector.parentGroup = parentGroup;
    } else {
      // no parent group
      selector.parentGroup = { $exists: false };
    }

    return GroupsCollection.find(selector, options);
  }
);

/**
 * Get full details for one group.
 * @param groupId {String}
 */
Meteor.publish('socialize.group.getInfo', groupId => {
  check(groupId, String);
  return GroupsCollection.find({ _id: groupId }, { limit: 1, sort: { name: 1 } });
});

/**
 * Get group with membership info for the current user.
 * @param groupId {String}
 */
publishComposite('socialize.group.get', function(groupId) {
  check(groupId, String);
  const userId = Meteor.userId();
  return {
    find() {
      return GroupsCollection.find({ groupId }, { limit: 1, sort: { name: 1 } });
    },
    children: [
      {
        find() {
          return GroupMembersCollection.find(
            { groupId, userId, removedAt: { $exists: false } },
            { limit: 1, sort: { createdAt: 1 } }
          );
        }
      }
    ]
  };
});

/**
 * Get list of members for the given group for authorized user.
 */
Meteor.publish('socialize.group.members', (groupId, options = { limit: 20, skip: 0, sort: { createdAt: 1 } }) => {
  check(groupId, String);
  check(
    options,
    Match.Maybe(
      Match.ObjectIncluding({
        limit: Number,
        skip: Number,
        sort: Match.Maybe(Match.Object())
      })
    )
  );
  // check access rights
  const member = GroupMembersCollection.findOne({ groupId, userId: Meteor.userId() });
  if (member.role) {
    return GroupMembersCollection.find({ groupId });
  }
  return null;
});
