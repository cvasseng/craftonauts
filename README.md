miner-escape (codename) / Craftonauts (final title)
============

Global Gam Jam 2013

Install:
    
    npm install

...in root. To run:

    
    node bin/miner-escape.js

Binds to port 3000. Only tested in chrome.

That is all. Time is out.


# Craftonauts - Created for GlobalGameJam 2013 - Hamar

Christer Vasseng - Programming/Game design

Kristoffer Jetmundsen - Game design/Programming/Art

Rolf Erik Hove - Art/Game design

Martin Kvale - Music/Sound



## Controls and things:
* WASD or arrow keys to move.
* Stand on items and press 'E' to pick them up.
* Select item from inventory list to the left and press 'G' to drop the item.
* Select item from inventory list and press 'SPACE' to use/eat the item if applicable.
* Select item from inventory and click 'CRAFT' in the right-side list to craft new stuff.
* Make sure you have the required materials for the item you are crafting, or else nothing will happen.
* Press 'Q' to turn off your headlight.

## Survival:
There are four elements of survival, three of them represented by bars in the top left, and one by a pulsating heart.


Health: Represented in red. You lose health when enemies attack you, by getting shanked by a player or from hazardous items.
Regain health by using bandages and other items or by standing near campfires (select and drop with 'G').
The health bar is more important than food and water for determining your pulse.


Food: Represented in yellow. You get hungry constantly over time. Eat things that are edible.


Water: Represented in blue. You get thirsty constantly over time. Drink non-deadly liquids to stay hydrated.


Pulse: Whenever your bars get low, your pulse will rise, indicated by more rapid beating of your heart. This is bad.
In addition, turning off your headlight (with 'Q') and standing around in the dark will also significantly raise your pulse.
If your health, food and water bars are high enough, your pulse will stabilize over time when you turn the light back on.
If your pulse gets too high, your heart will explode and you will die.
	
## Shank: 
* To craft a shank, you need to craft it by combining 'Wood' and 'Razorblade'. To equip it, select it in the inventory list.
* To swing it, press 'SPACE' while selected.

## Enemies:
There are two types of enemies in the game. 
	
* Shadownauts: Shadownauts are attracted to your light, and will follow and attack you as long as they can see you. If you turn off your headlight, you may have a chance to dodge them, but remember that this will raise your pulse.
	
* Other players with shanks: Players that have crafted shanks can equip them and attack other players. Either craft your own and fight back, or turn off your light and run. Other player's can't see you if your light is off, unless you are within another players lightsource.

## Misc:
* The game displays all possible crafting recipies when selecting an inventory item. Materials you currently have are represented in green.
* Some items have effects if you are carrying them, or standing near them. Check the tooltips by mousing over an inventory item.
* You start with a match and some wood, which can be crafted into a fireplace. Drop the fireplace and stand near it to regain health and calm yourself. You can even pick it up again.
* Play multiplayer. It's more fun. Maybe.
* Score points by crafting items and slaying monsters.
* Try to survive as long as you can.
