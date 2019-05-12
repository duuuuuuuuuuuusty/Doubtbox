# Doubtbox v.01
* Non-iframe based c-box mimicry for JC Ink's default shoutbox
* Requires JQuery 1.8+
* Coming soon to a Git near you

| Option  | Inputs | Behavior | Defaults |
| ------------- | ------------- | ------------- | ------------- |
| Timestamp  | 'relative' OR 'absolute'  | Affects timestamp type: 'Ten minutes ago' or '12 May 19, 5:10 pm' | relative  |
| Username  | 'default' OR 'custom'  | Switches between logged-in name and user-supplied nickname (effects are retroactive) | 'default'  |
| defaultUsername  | \<!-- \|field_X\| -->  | Loads nickname from custom profile field, if available | off  |
| typeOfID  | \<!-- \|parent_id\| -->  | Nickname will link to parent account | off  |
| avatar  | 'default' OR 'custom'  | Switches between logged-in avatar and user-supplied avatar (effects are retroactive)  | 'default'  |
| customMarkup | markup string  | Accepts a string of markup for custom message structures. Must include all default element classnames  | `'<div class="doubtboxMessage"><span class="dbMsgInnerWrap"><img class="dbUserAvatar"><span class="dbEditControl">[edit]</span><span class="dbDelControl">[X]</span><span class="dbMsgTime"></span><span class="dbMsgUser"><a></a></span><span class="dbMsgBodyWrap"><p class="dbMsgBody"></p></span></span></div>'` |
| channels  | array of strings  | Accepts an array of channel names. Leave blank for none  | none  |
| defaultChannel  | string  | If channels are active, determines which is selected on load  | off, selects first channel  |
| volumeLevels  | array of integers =< 1  | Accepts array of volume levels as integers  | [1, .4, 0]  |
| shoutPerPage  | integer  | Changes how many messages appear per-page. Cannot be higher than shoutbox configuration  | 10  |
| refreshType  | 'interval' | Switches between cyclic refreshing and manual refreshing  | interval  |
| refreshBase  | milliseconds | Affects the base refresh timer   | 5000  |
| refreshDecay  | milliseconds | Adds this number to refreshBase for every refresh with zero updates | 1000  |
| refreshDecayReset  | integer | Resets refresh timer after this many empty refreshes  | 20 |
| settingsStorage  | 'field_XYZ' OR 'cache' | Switches between settings storage types. 'field_20' will set and fetch settings from custom profile field #20. 'cache' will store settings in localStorage  | off  |
| shoutSource  | relative URL string | Changes where to source messages from  | '/index.php?act=Shoutbox'  |
