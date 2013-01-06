/*
Meteor.startup(function () {
    var require = __meteor_bootstrap__.require;
    var fs = require('fs');

    fs.symlinkSync('/tmp/uploads', 'public/uploads'); 
});
*/
Meteor.publish('users', function() {
  return Meteor.users.find();
});
Meteor.publish('item', function() {
  return Item.find();
});
Meteor.publish('userdetail', function() {
  return UserDetail.find();
});
Meteor.publish('chat', function() {
  return Chat.find();
});


Meteor.methods({
  'create_user': function(info) {
    if (Meteor.users.findOne({username: info.username}))
      throw new Meteor.Error(400, "用户已经存在");
    var uid = Accounts.createUser(info);
    UserDetail.insert({uid: uid,
                       username: info.username,
                       balance: 0
    });
    return uid;
  },

  'charge': function(charge) {
     UserDetail.update({uid: this.userId},
                       {$inc: {balance: charge}});
  },

  'add_item': function(info) {
    var tags = info.tags_str.split(/\ +/);
    info.tags = tags
    _.extend(info, {
       owner: this.userId,
       createAt: ts(),
       state: 'pending',
       buyer: undefined,
       buyAt: undefined
    });

    if (!info.name)
      throw new Meteor.Error(410, '请输入物品名称');
    info.price = validPrice(info.price);
    if (!info.price)
      throw new Meteor.Error(411, '请输入正确的价格');
    var item_id = Item.insert(info);
  },

  'buy_item': function(item_id) {
    var item = Item.findOne({_id: item_id});
    if (!item)
      throw new Meteor.Error(420, '物品不存在');

    if (item.state != 'pending')
      throw new Meteor.Error(421, '抱歉，该物品已经被购买');

    if (item.owner == this.userId)
      throw new Meteor.Error(422, '抱歉，您不能购买自己物品');

    var userdtl = UserDetail.findOne({uid: this.userId});
    if (item.price > userdtl.balance)
      throw new Meteor.Error(423, '抱歉，您余额不足，请先充值');

    Item.update({_id: item_id}, {$set: {buyer: this.userId, buyAt: ts(), state: 'traded'}});
    UserDetail.update({uid: this.userId}, {$inc: {balance: -item.price}});
    UserDetail.update({uid: item.owner}, {$inc: {balance: item.price}});
  },

  'delete_item': function(item_id) {
    var item = Item.findOne({_id: item_id});
    if (!item)
      throw new Meteor.Error(420, '物品不存在');

    if (item.state != 'pending')
      throw new Meteor.Error(421, '抱歉，该物品已经被购买');

    if (item.owner != this.userId)
      throw new Meteor.Error(422, '抱歉，您不能删除他人的物品');

    Item.remove({_id: item_id});
  },

  'reprice': function(item_id, price) {
    var item = Item.findOne({_id: item_id});
    if (!item)
      throw new Meteor.Error(420, '物品不存在');

    if (item.state != 'pending')
      throw new Meteor.Error(421, '抱歉，该物品已经被购买');

    if (item.owner != this.userId)
      throw new Meteor.Error(422, '抱歉，您不能修改他人的物品');

    var new_price = validPrice(price);
    if (!new_price)
      throw new Meteor.Error(422, '价格填写错误');

    if (new_price != item.price)
      Item.update({_id: item_id}, {$set: {price: new_price}});
  },

//
  saveFile: function(blob, name, path, encoding) {
    var path = cleanPath(path), fs = __meteor_bootstrap__.require('fs'),
      name = cleanName(name || 'file'), encoding = encoding || 'binary',
      chroot = Meteor.chroot || 'public/uploads';
      //chroot = Meteor.chroot || 'public';
    // Clean up the path. Remove any initial and final '/' -we prefix them-,
    // any sort of attempt to go to the parent directory '..' and any empty directories in
    // between '/////' - which may happen after removing '..'
    path = chroot + (path ? '/' + path + '/' : '/');
    
    // TODO Add file existance checks, etc...
    fs.writeFile(path + name, blob, encoding, function(err) {
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
      }
    }); 

    function cleanPath(str) {
      if (str) {
        return str.replace(/\.\./g,'').replace(/\/+/g,'').
          replace(/^\/+/,'').replace(/\/+$/,'');
      }
    }
    function cleanName(str) {
      return str.replace(/\.\./g,'').replace(/\//g,'');
    }
  }
});
