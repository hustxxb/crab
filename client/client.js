var x;

//Meteor.autosubscribe(function() {
  Meteor.subscribe('users');
  Meteor.subscribe('item');
  Meteor.subscribe('userdetail');
  Meteor.subscribe('chat');
//});

// utils
Handlebars.registerHelper('upload_dir', function(uid) {
  return '/uploads';
});

Handlebars.registerHelper('ranking_fontsize', function(x) {
  if (x>5000)
    return 42;
  if (x>2000)
    return 38;
  if (x>1000)
    return 36;
  if (x>500)
    return 30;
  if (x>200)
    return 24;
});

Handlebars.registerHelper('showUsername', function(uid) {
  return Meteor.users.findOne({_id: uid}).username;
});

Handlebars.registerHelper('highlineTag', function(name) {
  if (Session.get('query_tag') == name)
    return 'label-important';
  return ''
});

var alerterror = function(error){
        if (error) alert('error' + error);
      };

// market
Template.market.showitemindex = function(){
  var cp = Session.get('currentPage');
  return cp == 'itemindex' || cp == undefined;
};

Template.market.showwealth = function(){
  return Session.get('currentPage') == 'wealth';
};

Template.market.showchat = function(){
  return Session.get('currentPage') == 'chat';
};

Template.market.showmyindex = function(){
  return Session.get('currentPage') == 'myindex';
};

Template.market.alertmsg = function() {
  return Session.get('alertmsg');
};

// alertmsg
var cleanalertmsg = function() {
    Session.set('alertmsg', '');
}

var closealertmsg = function() {
    $('.alert').alert('close');
};

var alertmsg = function(msg) {
    Session.set('alertmsg', msg);
    Session.set('alerttype', 'success');
    setTimeout(closealertmsg, 2000);
    setTimeout(cleanalertmsg, 3000);
};

var alerterror = function(msg) {
    Session.set('alertmsg', msg);
    Session.set('alerttype', 'error');
    setTimeout(closealertmsg, 2000);
    setTimeout(cleanalertmsg, 3000);
};

//alerttip
Template.alerttip.alertmsg = function() {
  return Session.get('alertmsg');
};

Template.alerttip.alertTypeError = function() {
  return Session.get('alerttype') == 'error';
};


// navbar
Template.navbar.userDetail = function() {
  return UserDetail.findOne({uid: Meteor.userId()});
};

Template.navbar.events({
  'click #index': function(){
    Session.set('currentPage', 'itemindex');
    Session.set('query_tag', '');
    return false;
  },
  'click #wealth': function(){
    Session.set('currentPage', 'wealth');
    return false;
  },
  'click #chat': function(){
    Session.set('currentPage', 'chat');
    return false;
  },
  'click #myindex': function(){
    Session.set('currentPage', 'myindex');
    return false;
  },
  'click #logout': function(){
    Meteor.logout(alerterror);
    Session.set('currentPage', 'itemindex');
    return false;
  },
  'click #loginsubmit': function() {
    var u = document.getElementById('username').value;
    var p = document.getElementById('password').value;
    if (!u || !p) {
      alert('请输入用户名密码');
      return;
    }
    Meteor.loginWithPassword(u, p, alerterror);
//    Session.set('currentPage', 'itemindex');
    return false;
  }
});

// register
Template.register.events({
  'click #registersubmit': function() {
    var u = document.getElementById('reg_username').value;
    var p = document.getElementById('reg_password').value;
    var p2 = document.getElementById('reg_password2').value;
    if (!u || !p || !p2) {
      alert('请输入用户名密码');
      return false;
    }
    if (p != p2) {
      alert('两次输入密码不相同');
      return false;
    }

    Meteor.call('create_user', {
      username: u,
      password: p
    }, function(error, result){
      if (error) {
        alert(error.reason);
        return false;
      }
      $('#myModal').modal('hide');
      Meteor.loginWithPassword(u, p, alerterror);
    });
    return false;
  }
});

//itemindex
Template.itemindex.items = function() {
  var query_tag = Session.get('query_tag');
  if (!query_tag)
    return Item.find({state: 'pending'}, {sort: {createAt: -1}});
//  Session.set('query_tag', '');
  return Item.find({state: 'pending', tags: query_tag}, {sort: {createAt: -1}});
};

//myindex.........
Template.myindex.showmyinfo = function(){
  return Session.get('currentPageMy') == 'myinfo' ||
         Session.get('currentPageMy') == undefined;
};

Template.myindex.showmybuy = function(){
  return Session.get('currentPageMy') == 'mybuy';
};

Template.myindex.showmysell = function(){
  return Session.get('currentPageMy') == 'mysell';
};

Template.myindex.showmyadd = function(){
  return Session.get('currentPageMy') == 'myadd';
};

Template.myindex.events({
  'click #myinfo': function(){
    Session.set('currentPageMy', 'myinfo');
  },
  'click #mysell': function(){
    Session.set('currentPageMy', 'mysell');
  },
  'click #mybuy': function(){
    Session.set('currentPageMy', 'mybuy');
  },
  'click #myadd': function(){
    Session.set('currentPageMy', 'myadd');
  }
});

// myinfo
Template.myinfo.userinfo = function() {
  //var info = Meteor.user();
  var info = UserDetail.findOne({uid: Meteor.userId()});
  return info;
};

Template.myinfo.events({
  'click #chargesubmit': function() {
    var charge = validPrice(document.getElementById('charge').value);
    if (!charge) {
      // do nothing
      alerterror('输入金额不正确');
      return false;
    }
    Meteor.call('charge', charge);
//    alertmsg('成功充值 ' + charge + ' 元');
    return false;
  }
});

//mysell
Template.mysell.mysellitems = function() {
  return Item.find({owner: Meteor.userId()}, {sort: {createAt: -1}});
};

//mybuy
Template.mybuy.mybuyitems = function() {
  return Item.find({buyer: Meteor.userId()}, {sort: {buyAt: -1}});
};

//myadd
Template.myadd.events({
  'click #additemsubmit': function(event) {
    var image = Session.get('save-file-name');
    if (!image) {
      alerterror('请添加商品图片');
      return false;
    }
    var name = $('#additem #name').val();
    var price = $('#additem #price').val();
    var tags = $('#additem #tags').val();
    var desc = $('#additem #description').val();
    var info = {name: name,
                price: price,
                tags_str: tags,
                image: image,
                desc: desc
               };

    Meteor.call('add_item', info);
/*
      , function(error, result){
      if (error) {
        alert(error.reason);
        return false;
      }
    });
*/
    Session.set('save-file-name', undefined);
    Session.set('currentPageMy', 'mysell');
    alertmsg('添加商品成功');
    return false;
  },

  'change .input-file': function(ev) {
    _.each(ev.srcElement.files, function(file) {
      Meteor.saveFile(file, file.name);
      return false;
    });
    return false;
  }
});

//buy
Template.item.events({
  'click .buysubmit': function(event) {
    var item_id = event.target.value;
    $('#itemDetail' + item_id).modal('hide');
    Meteor.call('buy_item', item_id
      , function(error, result){
      if (error) {
        alerterror(error.reason);
        return false;
      }
    });
    Session.set('currentPageMy', 'mybuy');
    alertmsg('购买商品成功');
    return false;
  },

  'click .taglabel': function(event) {
x=event;
    Session.set('query_tag', event.target.innerText);
  }
});

//delete
Template.mysellitem.events({
  'click .deletesubmit': function(event) {
    var item_id = event.target.value;
    Meteor.call('delete_item', item_id
      , function(error, result){
      if (error) {
        alerterror(error.reason);
        return false;
      }
    });
    alertmsg('删除商品成功');
    return false;
  }
});

//reprice
Template.mysellitem.events({
  'click .repricesubmit': function(event) {
    var item_id = event.target.value;
    var price = $('#reprice_' + item_id).val();
    $('#repriceModal' + item_id).modal('hide');
    Meteor.call('reprice', item_id, price
      , function(error, result){
      if (error) {
        alerterror(error.reason);
        return false;
      }
    });
    alertmsg('改价成功');
    return false;
  }
});

//upload img
Meteor.saveFile = function(blob, name, path, type, callback) {
  var fileReader = new FileReader(),
    method, encoding = 'binary', type = type || 'binary';
  switch (type) {
    case 'text':
      // TODO Is this needed? If we're uploading content from file, yes, but if it's from an input/textarea I think not...
      method = 'readAsText';
      encoding = 'utf8';
      break;
    case 'binary': 
      method = 'readAsBinaryString';
      encoding = 'binary';
      break;
    default:
      method = 'readAsBinaryString';
      encoding = 'binary';
      break;
  }
  fileReader.onload = function(file) {
    Meteor.call('saveFile', file.srcElement.result, name, path, encoding, callback);
    Session.set('save-file-name', name);
  }
  fileReader[method](blob);
};

// wealth
Template.wealth.wealth_top20 = function() {
  var info = UserDetail.find({}, {sort: {balance: -1} });
  return info;
  var r = 1;
  return _.map(info, function(i) {
    i.ranking = r;
    r++;
  });
};


//chat
Template.chat.events({
  'keydown #input-chat': function(ev){
    if (ev.keyCode != 13) {
      return true;
    }

    var content = ev.target.value;
    if (!content)
      return true;

    Chat.insert({uid: Meteor.userId(), content: content, ts: ts()});
    ev.target.value = '';
    return false;
  }
});

Template.chat.chatlist = function() {
  var info = Chat.find({}, {sort: {ts: -1}}).fetch().slice(0,10);
  _.each(info, function(i) {
    if (!i.uid) {
      i.style = 'muted';
      return;
    }

    var style = ['text-warning', 'text-info', 'text-success', 'text-error'];
    var s = Asc(i.uid[0])%4;
    i.style = style[s];
  });
  //var info = Chat.find({}, {sort: {ts: -1}, limit: 5});
  //info.forEach(function(c) {c.style = 'hahah'; c.content='xixix';});
//  for (var i = 0; 
  return info;
};
