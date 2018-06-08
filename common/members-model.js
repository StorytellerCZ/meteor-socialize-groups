import { BaseModel } from 'meteor/socialize:base-model';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { LinkableModel } from 'meteor/socialize:linkable-model';

export const GroupMembersCollection = new Mongo.Collection('socialize:groupMembers');

const groupMembersSchema = new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  role: {
    type: String
    // allowedValues: ['owner', 'admin', 'moderator', 'member']
  },
  addedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) return new Date();
    },
    denyUpdate: true,
    index: 1
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue() {
      if (this.isUpdate) return new Date();
    }
  },
  removedAt: {
    type: Date,
    optional: true
  }
});

export class GroupMember extends BaseModel {}

GroupMembersCollection.attachSchema(groupMembersSchema);
GroupMember.attachCollection(GroupMembersCollection);
LinkableModel.registerParentModel(GroupMember);
