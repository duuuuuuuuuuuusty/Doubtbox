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

  function $doubtBox(options) {
    timestamp = options.timestamp || 'absolute';
    username = options.username || 'default';
    defaultUsername = options.defaultUsername || null;
    typeOfID = options.typeOfID || 'default';
    avatar = options.avatar || 'default';
    allowMarkup = options.allowMarkup || 'bb';
    customMarkup = options.customMarkup || '<div class="doubtboxMessage"><span class="dbMsgInnerWrap"><img class="dbUserAvatar"><span class="dbEditControl">[edit]</span><span class="dbDelControl">[X]</span><span class="dbMsgTime"></span><span class="dbMsgUser"><a></a></span><span class="dbMsgBodyWrap"><p class="dbMsgBody"></p></span></span></div>';
    channels = options.channels || ['Chat'];
    defaultChannel = options.defaultChannel || 'Chat';
    volumeLevels = options.volumeLevels || [1, .4, 0];
    shoutPerPage = options.shoutPerPage || 20;
    invertFlow = options.invertFlow || null;
    refreshType = options.refreshType || 'interval';
    refreshBase = options.refreshBase || 5000;
    refreshDecay = options.refreshDecay || 1000;
    refreshDecayReset = options.refreshDecayReset || 20;
    settingsStorage = options.settingsStorage || null;
    shoutSource = options.shoutSource || '/index.php?act=Shoutbox';
    var refreshCount = 0,
      pageIndex = 0,
      c = 0,
      v = 0,
      localMessages = [];
  
    let mutationTarget = document.getElementById('doubtfulBigChonk'),
      mutationConfig = {
        childList: true
      },
      mutationCallback = function(mutationsList, watcher) {
        for (var mutation of mutationsList) {
          for (var i = 0; i < mutation.removedNodes.length; i++) {
            var removedID = $(mutation.removedNodes[i]).attr('messageid'),
              removedIndex = localMessages.indexOf(removedID);
            if (removedID && removedIndex != -1) {
              console.log('Watcher log: nod removal: ', removedID, ' at ', removedIndex, localMessages)
              removedIndex == localMessages.length - 1 ? removedIndex = -1 : removedIndex = removedIndex;
              localMessages.splice(removedIndex, 1)
            }
          }
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            if (!$(mutation.addedNodes[i]).hasClass('doubtbox-ghost')) {
              var addedID = $(mutation.addedNodes[i]).attr('messageid');
              if (addedID > 0 && localMessages.indexOf(addedID) == -1) {
                localMessages.push(addedID)
              }
              console.log('Watcher log: node addition: ', addedID, localMessages)
            }
          }
        }
      },
      watcher = new MutationObserver(mutationCallback);
    watcher.observe(mutationTarget, mutationConfig);
  
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
  
    $.fn.fadeToRemove = function() {
      $(this).fadeOut(400, function() {
        $(this).remove()
      })
    };
  
    function stopProp() {
      window.clearTimeout(sbTimer);
      sbTimer = null;
    }
    $('.doubtbox-size-larger').click(function() {
      var state = parseFloat($('.doubtboxWrapper').attr('text'));
      $('.doubtboxWrapper').attr('text', state + .2).css('font-size', state + .2 + 'em')
    })
  
    $('.doubtbox-size-smaller').click(function() {
      var state = parseFloat($('.doubtboxWrapper').attr('text'));
      $('.doubtboxWrapper').attr('text', state - .2).css('font-size', state - .2 + 'em')
    })
  
    $('.doubtbox-refresh').click(function() {
      stopProp();
      mainOps();
    })
  
    $('.doubtbox-volume').click(function(e) {
      v++
      v > volumeLevels.length - 1 ? v = 0 : v
      $('.doubtbox-audio')[0].volume = volumeLevels[v]
      $(e.target).attr('level', volumeLevels[v])
    })
  
    $('.dbHistoryBack, .dbHistoryForward').click(function(e) {
      pageIndex = pageIndex + parseInt($(e.target).attr('jump'))
      $('#doubtboxPageRow').attr('index', pageIndex)
      if (pageIndex <= 0) {
        pageIndex = 0;
        refreshCount = 0;
      } else {
        stopProp();
      }
      mainOps('silent', pageIndex)
    })
  
    $(document).on('click', '.doubtbox-tab', function() {
      $('.doubtbox-tab-active').removeClass('doubtbox-tab-active')
      $(this).addClass('doubtbox-tab-active').removeClass('doubtbox-new-messages')
      $('.doubtboxMessage.doubtbox-hidden').removeClass('doubtbox-hidden')
      $('.doubtboxMessage:not(.doubtboxMessage[channel="' + $(this).attr('tab') + '"])').addClass('doubtbox-hidden')
    })
  
    $('#dbSendBtn').click(function() {
      var newMessage = {};
      newMessage.timestamp = Date.now().toString();
      newMessage.channel = $('.doubtbox-tab-active').attr('tab') || '';
      newMessage.username = $('#dbUserInput').val();
      if (!newMessage.username) {
        newMessage.username = '<!-- |name| -->' || 'Guest';
      }
      if (typeOfID == 'parent' && parseInt('<!-- |parent_id| -->') > 0) {
        newMessage.userID = '<!-- |parent_id| -->' || '0';
      } else {
        newMessage.userID = '<!-- |id| -->' || '0';
      }
      newMessage.group = '<!-- |g_id| -->';
      avatar == 'default' ? newMessage.avatar = doubtboxAvatar || '' : newMessage.avatar = $('#dbUrlInput').val() || ''
      newMessage.content = $('#dbMsgInput').val()
  
      if ($('#dbMsgInput').val()) {
        assembler(newMessage, function(ghostReturn) {
          $(ghostReturn).addClass('doubtbox-ghost')
          invertFlow ? $(ghostReturn).insertBefore('.dbStatusMessage') : $('#doubtfulBigChonk').prepend(ghostReturn)
        })
        $.post("/index.php?act=Shoutbox&submit=Shout", {
          Post: JSON.stringify(newMessage)
        }).done(function() {
          stopProp();
          $('#doubtboxPageRow').attr('index', 0);
          $('#dbMsgInput').val('');
          mainOps('silent');
          scrollyBoy(true);
        });
      } else {
        alert('Please enter a message')
      }
    })
  
    $(document).on('click', '.dbEditControl', function() {
      $(this).hide()
      stopProp();
      var p = $(this).parents('.doubtboxMessage');
      $('<span class="doubtbox-edit-channel" contenteditable>' + p.attr('channel') + '</span>').insertBefore($(this))
      $('<span class="doubtbox-edit-confirm">Confirm</span><span class="doubtbox-edit-cancel">Discard</span>').appendTo(p)
      p.addClass('doubtbox-editing')
      p.find('.dbMsgUser a').attr('contenteditable', true).on('click', function(e) {
        e.preventDefault();
      })
      p.find('.dbMsgBody').attr('contenteditable', true)
      p.find('.dbUserAvatar').click(function() {
        $('<div class="doubtbox-editing-url"><input type="text" value="' + $(this).attr('src') + '"><div class="doubtbox-url-accept">Confirm</div><div class="doubtbox-url-reset">Discard</div></div>').prependTo(p)
      })
    })
  
    $(document).on('click', '.doubtbox-url-accept', function() {
      $(this).parents('.doubtboxMessage').find('.dbUserAvatar').attr('src', $(this).siblings('input').val());
      $(this).parent('div').fadeToRemove();
    })
  
    $(document).on('click', '.doubtbox-url-reset', function() {
      $(this).parent('div').fadetoRemove();
    })
  
    $(document).on('click', '.dbDelControl', function() {
      if (confirm('Delete this shout?')) {
        stopProp();
        $.post('/index.php?&act=Shoutbox&sbmod=03&sid=' + $(this).attr('mid'))
        $(this).parents('.doubtboxMessage').fadeToRemove();
        mainOps('silent');
      }
    })
  
    $(document).on('click', '.doubtbox-edit-confirm', function() {
      let p = $(this).parents('.doubtboxMessage'),
        e = JSON.parse(p.attr('history')),
        id = p.attr('messageid');
      delete e.messageID
      e.content = p.find('.dbMsgBody').text()
      e.username = p.find('.dbMsgUser').text()
      e.avatar = p.find('.dbUserAvatar').attr('src')
      e.channel = p.find('.doubtbox-edit-channel').text()
      var form = new FormData();
      form.append('Post', JSON.stringify(e))
      form.append('submit', 'Edit Shout')
      $.ajax('/index.php?act=Shoutbox&sbmod=05&sid=' + id, {
        type: "POST",
        processData: false,
        contentType: false,
        data: form
      }).done(function(data) {
        ($(data).find('.postcolor').text().length > 0) ? (confirm($(data).find('.postcolor').text())) : p.find('.doubtbox-edit-cancel').trigger('click');
      })
    })
  
    $(document).on('click', '.doubtbox-edit-cancel', function() {
      var p = $(this).parents('.doubtboxMessage')
      p.removeClass('doubtbox-editing')
      p.find('.doubtbox-edit-confirm, .doubtbox-edit-cancel, .doubtbox-editing-url, .doubtbox-edit-channel').fadeToRemove();
      p.find('.dbMsgUser a, .dbMsgBody').attr('contenteditable', false).off()
      p.find('.dbEditControl').fadeIn(400)
      stopProp();
      mainOps('silent');
    })
  
    $('#dbMsgInput').keydown(function(e) {
      var kP = e.keyCode || e.which;
      if (kP == 13) {
        $('#dbSendBtn').trigger('click')
      }
    });
    mainOps();
    function mainOps(type, index) {
      $('.doubtbox-refresh div').addClass('rotating');
      c++;
      var url;
      index ? url = shoutSource + '&start=' + index : url = shoutSource;
  
      fetchData(url, function(messageData) {
        if (c > 1) {
          for (var i = 0; i < messageData.length; i++) {
            var e = messageData[i],
              chkContent = e.content.length.toString(),
              chkName = e.username || '',
              chkAv = e.avatar || '',
              chkChannel = e.channel || '',
              chkObj = $('.doubtboxMessage[messageid="' + e.messageID + '"]'),
              eL = JSON.stringify(e);
            if (chkObj.length > 0 && !chkObj.hasClass('doubtbox-ghost') && parseInt(chkObj.attr('chksum')) !== eL.length) { //that's a lot of conditions
              var modify = [];
              chkContent !== chkObj.attr('chksum') ? modify.push('content') : null;
              chkName != chkObj.find('.dbMsgUser').text() ? modify.push('username') : null;
              chkAv != chkObj.find('.dbUserAvatar').attr('src') ? modify.push('avatar') : null;
              chkChannel !== chkObj.attr('channel') ? modify.push('channel') : null;
              if (modify.length > 0) {
                console.log(modify);
                assembler(e, function($nM) {
                  for (var i = 0; i < modify.length; i++) {
                    switch (modify[i]) {
                      case 'content':
                        chkObj.find('.dbMsgBody').replaceWith($nM.find('.dbMsgBody'));
                        break;
  
                      case 'username':
                        chkObj.find('.dbMsgUser a').text(e.username);
                        break;
  
                      case 'avatar':
                        chkObj.find('.dbUserAvatar').attr('src', e.avatar);
                        break;
  
                      case 'channel':
                        chkObj.attr('channel', e.channel)
                        break;
                    }
                  }
                  chkObj.attr('chksum', JSON.stringify(e).length)
                })
  
              }
            }
          }
        }
        var newSet = [];
        for (var i = 0; i < messageData.length; i++) {
          newSet.push(messageData[i].messageID)
        }
        var sortedNew = newSet.slice(0);
        if (invertFlow) {
          localMessages.sort((a, b) => a - b);
          sortedNew.sort((a, b) => a - b)
        } else {
          localMessages.sort((a, b) => b - a);
          sortedNew.sort((a, b) => b - a)
        }
        console.log('pre-flight check: ', localMessages, sortedNew)
        if (localMessages.length != newSet.length || !(localMessages.every((value, index) => value === sortedNew[index]))) {
          refreshCount = 0;
          if (c > 1 && !index) {
            var loadedSet = [];
            $('.doubtboxMessage:not(.doubtbox-ghost)').each(function() {
              loadedSet.push($(this).attr('messageID'))
            })
            var updateSet = newSet.filter(x => !loadedSet.includes(x)),
              deleteSet = loadedSet.filter(x => !newSet.includes(x)),
              updateObj = messageData.filter(x => updateSet.includes(x.messageID));
            console.log(loadedSet, updateSet, updateObj)
            console.log('---------------')
            console.log(deleteSet)
            if (updateSet <= 0) {
              type = 'silent';
            }
            for (var i = 0; i < deleteSet.length; i++) {
              $('.doubtboxMessage[messageid="' + deleteSet[i] + '"]').fadeToRemove();
            }
            invertFlow ? updateObj.reverse() : null
            updateObj.forEach(function(e) {
              assembler(e, function($newMessage) {
                $('.doubtbox-ghost').each(function() {
                  if ($(this).find('.dbMsgTime').attr('time') == e.timestamp) {
                    $(this).attr('messageid', e.messageID).removeClass('doubtbox-ghost')
                    $(this).find('.dbEditControl, .dbDelControl').attr('mid', e.messageID)
                    $(this).find('.dbMsgBody').replaceWith($newMessage.find('.dbMsgBody'))
                    $newMessage = $(this);
                  }
                })
                if (invertFlow) {
                  orderedSet = newSet.sort((a, b) => a - b),
                    a = orderedSet.indexOf(e.messageID);
                  console.log(orderedSet, a, e.messageID)
                  if (a >= $('.doubtboxMessage').length) {
                    $newMessage.insertBefore('.dbStatusMessage')
                  } else if (a == 0) {
                    $newMessage.prependTo('#doubtfulBigChonk')
                  } else {
                    $newMessage.insertAfter('.doubtboxMessage[messageid="' + orderedSet[a - 1] + '"]')
                    console.log('placing ', e.messageID, ' at ', $('.doubtboxMessage[messageid="' + orderedSet[a - 1] + '"]'))
                  }
                } else {
                  orderedSet = newSet.sort((a, b) => b - a),
                    a = orderedSet.indexOf(e.messageID);
                  console.log(orderedSet, a, e.messageID);
                  if (a >= $('.doubtboxMessage').length) {
                    $newMessage.insertBefore('.dbStatusMessage')
                  } else if (a == 0) {
                    $newMessage.prependTo('#doubtfulBigChonk')
                  } else {
                    $newMessage.insertBefore('.doubtboxMessage[messageid="' + orderedSet[a + 1] + '"]')
                    console.log('placing ', e.messageID, ' at ', $('.doubtboxMessage[messageid="' + orderedSet[a + 1] + '"]'))
                  }
                }
                if (type != 'silent' && channels) {
                  $('.doubtbox-tab:not(.doubtbox-tab-active)[tab="' + e.channel + '"]').addClass('doubtbox-new-messages')
                }
  
              })
              if ($('.doubtbox-tab-active').attr('tab') == e.channel) {
                scrollyBoy();
              }
            })
          } else {
  
            console.log('full refresh!')
            $('.doubtboxMessage').remove();
            $('.dbStatusMessage').text('Hm. There doesn\'t seem to be anything here..');
            messageData.forEach(function(e) {
              assembler(e, function(newMessage) {
                invertFlow ? $(newMessage).prependTo('#doubtfulBigChonk') : $(newMessage).insertBefore('.dbStatusMessage')
              })
            })
          }
          (c >= 1 && localMessages.length > 0 && type != 'silent') ? $('.doubtbox-audio')[0].play(): null;
        } else {
          refreshCount++;
          console.log('nothing new found;')
        }
        $('.doubtbox-refresh div').removeClass('rotating')
        if (c <= 1) {
          initialization();
        }
        if (timestamp == 'relative') {
          $('.dbMsgTime').each(function() {
            $(this).text(timeOps($(this).attr('time')))
          })
        }
        if (refreshType == 'interval' && $('#doubtboxPageRow').attr('index') == 0) {
          refreshCount >= refreshDecayReset ? refreshCount = 0 : refreshCount
          window.sbTimer = null;
          if (sbTimer != null) {
            stopProp();
          } else {
            window.clearTimeout(sbTimer);
            sbTimer = window.setTimeout(mainOps, refreshBase + (refreshDecay * refreshCount))
          }
        }
      })
    };
  
    function scrollyBoy(bigMood) {
      let dBC = document.getElementById('doubtfulBigChonk');
      var targetNodes = document.querySelectorAll('.doubtboxMessage:not(.doubtbox-hidden)'),
        contentHeight = dBC.scrollHeight,
        windowHeight = dBC.offsetHeight,
        scrolledX = dBC.scrollTop,
        targetMessage;
      !targetNodes.length ? targetMessage = 0 : (invertFlow ? targetMessage = targetNodes[targetNodes.length - 1].scrollHeight : targetMessage = targetNodes[0].scrollHeight);
      if (invertFlow) {
        console.log('scroling inverted')
        if (windowHeight + scrolledX >= contentHeight - targetMessage + 5 || bigMood) {
          $('#doubtfulBigChonk').stop().animate({
            scrollTop: contentHeight
          }, 800);
        }
      } else {
        console.log('scrolling LIKE A NORMAL GODDAMN HUMAN BEING')
        if (scrolledX <= targetMessage + 5 || bigMood) {
          $('#doubtfulBigChonk').stop().animate({
            scrollTop: 0
          }, 800);
        }
      }
    }
  
    function markupParser(str) {
      console.log(allowMarkup)
      var parseElem = document.createElement('div'),
        fragment = document.createDocumentFragment();
      parseElem.innerHTML = str;
      var message;
  
      switch (allowMarkup) {
        case 'bb':
          message = str;
          break;
  
        case 'html':
          for (var i = 0; i < parseElem.childNodes.length; i++) {
            var a = parseElem.childNodes[i].cloneNode(true);
            if (a.nodeType === 3) {
              fragment.appendChild(document.createRange().createContextualFragment(a.nodeValue))
            } else {
              fragment.appendChild(document.createTextNode(a.innerText))
            }
          }
          message = fragment;
          break;
  
        case 'both':
          for (var i = 0; i < parseElem.childNodes.length; i++) {
            var a = parseElem.childNodes[i].cloneNode(true);
            if (a.nodeType === 3) {
              fragment.appendChild(document.createRange().createContextualFragment(a.nodeValue))
            } else {
              fragment.appendChild(a)
            }
          }
          message = fragment;
          break;
  
        case 'none':
          for (var i = 0; i < parseElem.childNodes.length; i++) {
            var a = parseElem.childNodes[i].cloneNode(true);
            if (a.nodeType === 3) {
              fragment.appendChild(document.createRange().createContextualFragment(a.nodeValue))
            } else {
              fragment.appendChild(a)
            }
          }
          message = fragment
          break;
      }
      message = DOMPurify.sanitize(message)
      console.log('the message is ', message)
      return message;
    }
    
    function initialization() {
      sleep(500).then(() => {
        scrollyBoy(true);
      })
      if (username == 'default') {
        $('input#dbUserInput').hide()
      } else if (defaultUsername.length > 0 && '<!-- |g_id| -->' != '2') {
        $('input#dbUserInput').val(defaultUsername)
      }
      if (avatar == 'default') {
        $('input#dbUrlInput').val(doubtboxAvatar).hide()
      }
      for (var i = 0; i < channels.length; i++) {
        $('<span class="doubtbox-tab" tab="' + channels[i] + '">' + channels[i] + '</span>').appendTo('#doubtboxChannelRow')
      }
      $('.dbHistoryForward').attr('jump', 0 - shoutPerPage)
      $('.dbHistoryBack').attr('jump', shoutPerPage)
  
      var cachedPreferences;
      if (settingsStorage == 'cache') {
        if (localStorage.getItem('doubtboxPreferences')) {
          cachedPreferences = JSON.parse(localStorage.getItem('doubtboxPreferences'))
        }
        $(window).on("beforeunload", function() {
          let preferences = {};
          preferences.fontSize = $('.doubtboxWrapper').attr('text');
          preferences.boxSize = [$('.doubtboxWrapper').width(), $('.doubtboxWrapper').height()];
          preferences.volume = $('.doubtbox-volume').attr('level');
          preferences.username = $('#dbUserInput').val();
          preferences.avatar = $('#dbUrlInput').val();
          preferences.channel = $('.doubtbox-tab-active').attr('tab')
          localStorage.setItem('doubtboxPreferences', JSON.stringify(preferences))
        });
      } else if (settingsStorage.indexOf('field') != -1) {
        if (doubtboxPreferences) {
          try {
            cachedPreferences = JSON.parse($('<div></div>').html(doubtboxPreferences).text())
          } catch (e) {
            console.log(e)
            cachedPreferences = '';
          }
        }
        $('.doubtbox-control-row').prepend($('<span class="doubtbox-save-status"></span><span class="doubtbox-save-pref">Save Preferences</span>'))
        $(document).on('click', '.doubtbox-save-pref', function() {
          let preferences = {};
          preferences.fontSize = $('.doubtboxWrapper').attr('text');
          preferences.boxSize = [$('.doubtboxWrapper').width(), $('.doubtboxWrapper').height()];
          preferences.volume = $('.doubtbox-volume').attr('level');
          preferences.username = $('#dbUserInput').val();
          preferences.avatar = $('#dbUrlInput').val();
          preferences.channel = $('.doubtbox-tab-active').attr('tab')
  
          fetch('/index.php?act=UserCP&CODE=01')
            .then(response => response.text())
            .then(text => {
              let parser = new DOMParser();
              let res = parser.parseFromString(text, "text/html");
              let result = {};
              $.each($(res).find('form[name="theForm"]').serializeArray(), function() {
                result[this.name] = this.value;
              });
              let formData = new FormData();
              for (var key in result) {
                formData.append(key, result[key])
              }
              formData.set(settingsStorage, JSON.stringify(preferences))
              console.log(formData.get(settingsStorage))
              fetch('/index.php?auth_key=' + doubtboxAuth, {
                  method: 'POST',
                  body: formData
                }).then(response => response.text())
                .then(text => {
                  let parser = new DOMParser();
                  let res = parser.parseFromString(text, "text/html");
                  if ($(res).find('#redirect-screen').length > 0) {
                    $('.doubtbox-save-status').text('Saved!').show(function() {
                      $('.doubtbox-save-status').fadeOut(1200)
                    })
                  } else {
                    $('.doubtbox-save-status').text('Failed!').show(function() {
                      $('.doubtbox-save-status').fadeOut(1200)
                    })
                  }
                })
            })
        })
      }
      if (cachedPreferences != '') {
        $('.doubtboxWrapper').attr('text', cachedPreferences.fontSize).css('font-size', cachedPreferences.fontSize + 'em').width(cachedPreferences.boxSize[0]).height(cachedPreferences.boxSize[1]);
        $('.doubtbox-volume').attr('level', cachedPreferences.volume);
        v = volumeLevels.indexOf(parseFloat(cachedPreferences.volume));
        $('.doubtbox-audio')[0].volume = cachedPreferences.volume;
        $('#dbUserInput').val(cachedPreferences.username);
        $('#dbUrlInput').val(cachedPreferences.avatar);
        if (defaultChannel != 'cache' && $('.doubtbox-tab[tab="' + defaultChannel + '"]').length > 0) {
          $('.doubtbox-tab[tab="' + defaultChannel + '"]').trigger('click')
          console.log('1', $('.doubtbox-tab[tab="' + defaultChannel + '"]'))
        } else if (defaultChannel == 'cache' && $('.doubtbox-tab[tab="' + cachedPreferences.channel + '"]').length > 0) {
          $('.doubtbox-tab[tab="' + cachedPreferences.channel + '"]').trigger('click')
          console.log('2', $('.doubtbox-tab[tab="' + cachedPreferences.channel + '"]'))
        }
      } else {
        $('.doubtbox-tab:first').trigger('click')
        console.log('3', $('.doubtbox-tab:first'))
      }
    }
  
    function assembler(messageData, callback) {
      var newMessage = $.parseHTML(customMarkup),
        $nM = $(newMessage),
        nMstr = JSON.stringify(messageData);
      $nM.attr('sb-gid', messageData.group).attr('sb-mid', messageData.userID).attr('channel', messageData.channel).attr('messageID', messageData.messageID).attr('chksum', nMstr.length).attr('history', nMstr)
      if (messageData.channel != $('.doubtbox-tab-active').attr('tab')) {
        $nM.addClass('doubtbox-hidden')
      }
      if (messageData.userID == '' || messageData.userID == '0') {
        $nM.find('.dbMsgUser a').remove();
        $('<span class="doubtboxGuest"></span>').text(messageData.username).appendTo($nM.find('.dbMsgUser'))
      } else {
        $nM.find('.dbMsgUser a').attr('href', '/index.php?showuser=' + messageData.userID).text(messageData.username)
      }
      if (allowMarkup === 'none') {
        console.log(markupParser(messageData.content))
        $nM.find('.dbMsgBody').text(markupParser(messageData.content))
      } else {
        console.log(messageData.messageID, ' running')
        $nM.find('.dbMsgBody').append(markupParser(messageData.content))
      }
      $nM.find('.dbUserAvatar').attr('src', DOMPurify.sanitize(messageData.avatar))
      $nM.find('.dbMsgTime').attr('time', messageData.timestamp).text(timeOps(messageData.timestamp))
      $nM.find('.dbEditControl, .dbDelControl').attr('mid', messageData.messageID)
      callback($nM)
    }
  
    function timeOps(mDt) {
      var t = new Date(parseInt(mDt)),
        absoluteTime = t.toLocaleString('en-gb', {
          day: "numeric",
          month: "short",
          year: "2-digit"
        }) + ', ' + t.toLocaleString('en-gb', {
          hour12: true,
          hour: "numeric",
          minute: "numeric"
        })
      if (timestamp == 'relative') {
        var secondsPast = (Date.now() - new Date(parseInt(mDt))) / 1000,
          str;
        Math.sign(secondsPast) < 0 ? secondsPast = 0 : secondsPast = secondsPast;
        switch (true) {
          case (secondsPast < 60):
            str = parseInt(secondsPast) + ' ' + ((secondsPast == 1) ? 'second' : 'seconds') + ' ago';
            break;
          case (secondsPast < 3600):
            str = parseInt(secondsPast / 60) + ' ' + ((secondsPast / 60 <= 2) ? 'minute' : 'minutes') + ' ago';
            break;
          case (secondsPast < 86400):
            str = parseInt(secondsPast / 3600) + ' ' + ((secondsPast / 3600 <= 2) ? 'hour' : 'hours') + ' ago';
            break;
          case (secondsPast < 604800):
            str = parseInt(secondsPast / 86400) + ' ' + ((secondsPast / 86400 <= 2) ? 'day' : 'days') + ' ago';
            break;
          case (secondsPast < 1814400):
            str = parseInt(secondsPast / 604800) + ' ' + ((secondsPast / 604800 <= 2) ? 'week' : 'weeks') + ' ago';
            break;
          default:
            str = absoluteTime;
        };
      } else {
        str = absoluteTime;
      }
      return str
    }
  
    function fetchData(url, callback) {
      fetch(url).then(response => response.text()).then(text => {
        let parser = new DOMParser();
        let data = parser.parseFromString(text, 'text/html');
        let messageArray = [];
        var dbH = $('.dbHistoryBack');
        (dbH.is(':visible') && $(data).find('form[name="DShoutbox"] p:last a').length) ? dbH.show(): dbH.hide()
        var messageDiv = $(data).find('form[name="DShoutbox"]').children('div:not(.pformstrip)')
        for (var i = 0; i < messageDiv.length; i++) {
          let savedMessage = $(messageDiv[i]).find('div:eq(1) span');
          let formattedMessage = {};
          try {
            var parsedBody = JSON.parse(savedMessage.html());
            if (Object.keys(parsedBody).length != 7) throw "Parsed message has invalid key counts: " + savedMessage.text();
          } catch (e) {
            var s = savedMessage.html(),
              parsedBody = {};
            s = s.substring(2, s.length - 2);
            parsedBody.timestamp = s.substring(s.indexOf('"timestamp":""') + 13, s.indexOf('","', s.indexOf('"timestamp":"') + 13));
            parsedBody.channel = s.substring(s.indexOf('"channel":"') + 11, s.indexOf('","', (s.indexOf('"channel":"') + 11)));
            parsedBody.username = s.substring(s.indexOf('"username":"') + 12, s.indexOf('","', s.indexOf('"username":"') + 12));
            parsedBody.userID = s.substring(s.indexOf('"userID":"') + 10, s.indexOf('","', s.indexOf('"userID":"') + 10));
            parsedBody.group = s.substring(s.indexOf('"group":"') + 9, s.indexOf('","', s.indexOf('"group":"') + 9));
            parsedBody.avatar = s.substring(s.indexOf('"avatar":"') + 10, s.indexOf('","', s.indexOf('"avatar":"') + 10));
            parsedBody.content = s.substring(s.indexOf('"content":"') + 11);
          }
          let messageDetails = $(messageDiv[i]).find('.post1:last-of-type'),
            userElement = messageDetails.children('a').eq(1);
          (username == 'default') ? formattedMessage.username = userElement.text(): formattedMessage.username = parsedBody.username;
          (avatar == 'default') ? formattedMessage.avatar = messageDetails.prev().children('img').attr('src'): formattedMessage.avatar = parsedBody.avatar;
          (typeOfID == 'default') ? formattedMessage.userID = userElement.attr('href').slice(userElement.attr('href').lastIndexOf('=') + 1): formattedMessage.userID = parsedBody.userID;
          formattedMessage.group = parsedBody.group;
          formattedMessage.channel = parsedBody.channel;
          formattedMessage.content = parsedBody.content;
          formattedMessage.timestamp = parsedBody.timestamp;
          formattedMessage.messageID = messageDetails.children('a').eq(0).text().substring(1);
          messageArray.push(formattedMessage);
        }
        callback(messageArray)
      })
    }
  }
