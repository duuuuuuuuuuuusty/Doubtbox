$doubtBox({
  timestamp: 'relative', //Message time-stamp type: 'X minute ago' or
  username: 'custom', // default, custom.
  defaultUsername: '<!-- |field_1| -->', //profile field is preferred input
  typeOfID: 'parent', //parent ID, user ID
  avatar: 'default',// default, custom.
  allowMarkup: 'bb', //none, bb, html, both
  customMarkup: '<div class="doubtboxMessage"><span class="dbMsgInnerWrap"><img class="dbUserAvatar"><span class="dbEditControl">[edit]</span><span class="dbDelControl">[X]</span><span class="dbMsgTime"></span><span class="dbMsgUser"><a></a></span><span class="dbMsgBodyWrap"><p class="dbMsgBody"></p></span></span></div>', // Default (c-box style) or custom
  channels: ['Announcements', 'Out of Character', 'In-character'],// listed, off
  defaultChannel: 'cache', // specified, 'cache', off
  volumeLevels: [1, .4, 0],// user-defined, default
  shoutPerPage: 10,//integer should match shoutbox settings, default: 100;
  invertFlow: false, //true, false(default)
  refreshType: 'interval',//Interval, off
  refreshBase: 5000,
  refreshDecay: 2000, //every empty refresh, add this to Base for refresh timer
  refreshDecayReset: 10, //after X refreshes, reset timer to base
  settingsStorage: 'field_20',//Cache, profile-field-number, off
  shoutSource: '/index.php?act=Shoutbox'//Default, +skinid
})
