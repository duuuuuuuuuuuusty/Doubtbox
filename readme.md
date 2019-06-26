# Doubtbox v.01
* JQuery based c-box mimicry for JC Ink's default shoutbox
* Requires JQuery 1.8+
* BB/HTML markup integrated
* Utilizes DOMPurify to filter dangerous messages
* Coming soon to a Git near you

# Installation
* Install to CSS, HTML, and JS to custom page. Use page <% TAG %> to append
* Upload purify_min.js and append to page
* Upload notification audio and append its source to _.doubtbox-audio_ element in page
* Install doubtboxWrapper.js to **wrapper** body
* Configure options in doubtboxWrapper.js

| Option  | Inputs | Behavior | Default behavior |
| ------------- | ------------- | ------------- | ------------- |
| Timestamp  | 'relative' OR 'absolute'  | Affects timestamp type: 'Ten minutes ago' or '12 May 19, 5:10 pm'. Relative timestamping rolls over to absolute after 3 weeks | absolute timing |
| Username  | 'custom' OR 'default'  | Allows users to change their chat nicknames (effects are retroactive) | default: uses logged-in username |
| defaultUsername  | \<!-- \|field_X\| --> OR default  | Loads nickname from custom profile field, if available | default: 'null'. no profile fields are utilized |
| typeOfID  | parent OR default  | Nickname will link to parent account | default: nickname links to logged-in user ID |
| avatar  | custom OR default  | Allows users to supply their own avatar URL. Effects are retroactive: If changed to default, will load up-to-date avatar image from accounts | default: loads account avatar  |
| customMarkup | markup string OR leave empty  | Accepts a string of markup for custom message structures. Must include all default element classnames: see 'custom markup' section for more details  | `'<div class="doubtboxMessage"><span class="dbMsgInnerWrap"><img class="dbUserAvatar"><span class="dbEditControl">[edit]</span><span class="dbDelControl">[X]</span><span class="dbMsgTime"></span><span class="dbMsgUser"><a></a></span><span class="dbMsgBodyWrap"><p class="dbMsgBody"></p></span></span></div>'` |
| channels  | array of strings  | Accepts an array of channel names. Defaults to a single channel named 'chatter', which may be hidden with CSS | \['Chatter'] |
| defaultChannel  | 'cache' OR string | Determines which channel is active by default. 'cache' will attempt to load stored channel preference | default: selects first channel  |
| volumeLevels  | array of integers =< 1, greatest to smallest  | Accepts array of volume levels as integers. Note: Volume icons controlled by CSS  | default: \[1, .4, 0]  |
| shoutPerPage  | integer  | Should match value in Shoutbox Settings; Controls page jump value | 20  |
| invertFlow | true OR false | Inverts the flow direction of messages; TRUE loads newest messages at bottom | default: false |
| refreshType  | 'interval' OR off | Switches between cyclic refreshing and manual refreshing. Interval is calculated as (refreshBase + (refreshDecay * emptyRefresh)), where *emptyRefresh* is the number of times a refresh has yielded no new messages  | default: interval |
| refreshBase  | integer of milliseconds | Affects the base refresh timer | default: 5000  |
| refreshDecay  | integer of milliseconds | Adds this number to refreshBase for every refresh with zero updates | default: 1000  |
| refreshDecayReset  | integer | Resets refresh timer after this many empty refreshes | default: 20 |
| settingsStorage  | 'field_XYZ' OR 'cache' OR off | Switches between settings storage types. 'field_20' will set and fetch settings from custom profile field #20. 'cache' will store settings in localStorage  | default: off  |
| shoutSource  | URL string | Changes where to source messages from  | '/index.php?act=Shoutbox'  |

# Custom Markup Structure
The doubtbox can configure message structure to specification. The following elements compose the default structure:

| Elementclassname | purpose | required? |
| --- | --- | --- |
| *doubtboxMessage* | Message container. Highest parent in hierarchy. Contains all message information in attributes | required |
| *dbMsgInnerWrap* | Inner wrapper for message | optional |
| *dbUserAvatar* | img: Avatar element | required (may be hidden via CSS) |
| *dbEditControl* | span: Allows administrators to edit messages | required (may be hidden via CSS) |
| *dbDelControl* | span: Allows administrators to delete messages | required (may be hidden via CSS) |
| *dbMsgTime* | span: Contains timestamp information | required (may be hidden via CSS) |
| *dbMsgUser a* | span a: Links to user ID | required (may be hidden via CSS) |
| *dbMsgBodyWrap* | span: Message content parent container | optional |
| *dbMsgBody* | p: Message content element | required |

# Usage & Notes
It's important that the sum of the refresh timer is not set too low, nor the shoutPerPage set too high, as each refresh requests the shoutbox page *and* performs check functions to match message IDs and content length. While this is not strenuous for most computers, it is still something of a burden and ought to be minimized. If you want instantaneous updates, I'd recommend using an actual C-Box, or a Discord integration.


Usage for the end-user is fairly straightforward, and should be familiar if you've ever used a c-box.

**Previous** and **Next** buttons allow users to traverse message history, and suspend refreshing while viewing. Refreshing or sending a message will bring the user to the present content.

**Channels** allow the staff to set up separate chatter areas for different topics. Remember that each channel technically shares the same refresh stream - if all of the recent messages belong to one channel, other channels will appear empty, even if there are messages for them further in the history. Unselected channel tabs with new content are modified with the *.doubtbox-new-messages* class.

**Aa and aA** are font-size adjustments, affecting only the doubtbox.

**🔊 🔉 🔈** are volume level icons, representing high (1.0), low (0.4), and mute (0.0) levels. These can be changed in CSS.

**Save Preferences** will appear if the shoutbox is configured to use server-side profile fields as preference storage. This button will attempt to save the user's current settings for the doubtbox (name, avatar, volume level, channel, font-size, and doubtbox dimensions) to the supplied profile field.

**[edit] and [X]** are functional to, and appear only for, administrator accounts (by default, user group 4 - change in CSS). These buttons allow staff to delete messages (with a confirmation dialogue), or edit messages including avatar, text content, name, and/or channel. Timestamps cannot be changed without navigating to */act=Shoutbox* and manually editing the timestamp variable.

**Send** predictably sends the message, so long as the message field has content. While the message field has focus, the enter key will also send a message. Newly sent content will appear first as ghosted messages, and later be updated when it is confirmed that the message reached the server.
