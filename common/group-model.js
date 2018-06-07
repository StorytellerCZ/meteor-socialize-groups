import { BaseModel } from 'meteor/socialize:base-model';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { LinkParent } from 'meteor/socialize:linkable-model';
import { PostableModel } from 'meteor/socialize:postable';

export const GroupsCollection = new Mongo.Collection('socialize:groups');

const groupSchema = new SimpleSchema({
  name: {
    type: String,
    index: 1
  },
  type: {
    type: String,
    index: 1
    // allowedValues: ['organization', 'group', 'team']
  },
  visibility: {
    type: String,
    index: 1,
    allowedValues: ['hidden', 'closed', 'open']
  },
  slug: {
    type: String,
    index: 1,
    unique: 1,
    optional: true
  },
  description: {
    type: String
  },
  parentGroup: {
    type: String,
    regex: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },
  i18n: {
    type: Object,
    blackbox: true,
    optional: true
  },
  membersCount: {
    type: Number,
    index: 1,
    defaultValue: 1
  },
  createdAt: {
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
  }
});

export class Group extends PostableModel(LinkParent) {}

GroupsCollection.attachSchema(groupSchema);
Group.attachCollection(GroupsCollection);
LinkableModel.registerParentModel(Group);
